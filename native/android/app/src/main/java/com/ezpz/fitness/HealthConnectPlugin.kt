package com.ezpz.fitness

import android.content.Intent
import androidx.activity.result.ActivityResult
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.*
import androidx.health.connect.client.records.metadata.DataOrigin
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import com.getcapacitor.*
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.ActivityCallback
import kotlinx.coroutines.*
import java.time.*

/** Explicit, read-only, single-origin snapshots. No worker or cross-source sum. */
@CapacitorPlugin(name = "EzpzHealthConnect")
class HealthConnectPlugin : Plugin() {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private val origin = setOf(DataOrigin("com.whoop.android"))
    private val permissionMetrics = linkedMapOf(
        HealthPermission.getReadPermission(StepsRecord::class) to "steps",
        HealthPermission.getReadPermission(SleepSessionRecord::class) to "sleep",
        HealthPermission.getReadPermission(ActiveCaloriesBurnedRecord::class) to "activeCalories",
        HealthPermission.getReadPermission(TotalCaloriesBurnedRecord::class) to "totalCalories",
        HealthPermission.getReadPermission(ExerciseSessionRecord::class) to "workouts"
    )
    private fun client(): HealthConnectClient {
        check(HealthConnectClient.getSdkStatus(context) == HealthConnectClient.SDK_AVAILABLE) {
            "Health Connect is unavailable. Install or update it in Android settings."
        }
        return HealthConnectClient.getOrCreate(context)
    }
    @PluginMethod fun status(call: PluginCall) {
        scope.launch {
            try {
                val available = HealthConnectClient.getSdkStatus(context) == HealthConnectClient.SDK_AVAILABLE
                val granted = if (available) client().permissionController.getGrantedPermissions() else emptySet()
                call.resolve(JSObject().put("available", available).put("metrics", JSArray(permissionMetrics.filterKeys { it in granted }.values.toList())))
            } catch (_: Exception) { call.reject("Could not check Health Connect permissions. Reopen the app and try again.") }
        }
    }
    @PluginMethod override fun requestPermissions(call: PluginCall) {
        try {
            client()
            val intent = PermissionController.createRequestPermissionResultContract().createIntent(context, permissionMetrics.keys)
            startActivityForResult(call, intent, "permissionResult")
        } catch (_: Exception) { call.reject("Health Connect is unavailable. Install or update it in Android settings.") }
    }
    @ActivityCallback private fun permissionResult(call: PluginCall?, result: ActivityResult) {
        if (call == null) return
        status(call) // Re-read actual grants; cancellation is never treated as success.
    }
    @PluginMethod fun openSettings(call: PluginCall) {
        try { activity.startActivity(Intent(HealthConnectClient.ACTION_HEALTH_CONNECT_SETTINGS)); call.resolve() }
        catch (_: Exception) { call.reject("Open Health Connect from Android Settings to change EZPZ permissions.") }
    }
    private suspend fun readWhoopSteps(hc: HealthConnectClient, start: Instant, end: Instant): List<StepsRecord> {
        val records = mutableListOf<StepsRecord>()
        var token: String? = null
        do {
            val page = hc.readRecords(ReadRecordsRequest(StepsRecord::class,
                TimeRangeFilter.between(start, end), dataOriginFilter = origin, pageSize = 1000, pageToken = token))
            records.addAll(page.records)
            token = page.pageToken?.takeIf { it.isNotBlank() }
            check(records.size <= 10000) { "Too many WHOOP step records. Saved records were kept." }
        } while (token != null)
        return records
    }
    private fun stepPeriods(records: List<StepsRecord>, zone: ZoneId, now: Instant) =
        WhoopStepPeriods.daily(records.map { WhoopStepPeriods.Record(it.startTime, it.endTime, it.endZoneOffset, it.count) }, zone, now)
    /** Read-only comparison includes both calendar aggregation and whole WHOOP periods. */
    @PluginMethod fun checkSteps(call: PluginCall) {
        scope.launch {
            try {
                val hc = client()
                val permission = HealthPermission.getReadPermission(StepsRecord::class)
                check(permission in hc.permissionController.getGrantedPermissions()) { "Allow EZPZ Steps access first." }
                val zone = ZoneId.systemDefault()
                val now = Instant.now()
                val day = now.atZone(zone).toLocalDate().minusDays(1)
                val (start, end) = StepDays.bounds(day, zone)
                suspend fun total(a: Instant, b: Instant): Long? = hc.aggregate(
                    AggregateRequest(setOf(StepsRecord.COUNT_TOTAL), TimeRangeFilter.between(a, b), origin)
                )[StepsRecord.COUNT_TOTAL]
                val localTotal = total(start, end)
                val utcTotal = total(day.atStartOfDay(ZoneOffset.UTC).toInstant(), day.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant())
                val storedDateTotal = hc.aggregate(AggregateRequest(setOf(StepsRecord.COUNT_TOTAL),
                    TimeRangeFilter.between(day.atStartOfDay(), day.plusDays(1).atStartOfDay()), origin))[StepsRecord.COUNT_TOTAL]
                val records = readWhoopSteps(hc, start.minus(Duration.ofDays(2)), minOf(end.plus(Duration.ofDays(1)), now))
                val periodResult = runCatching { stepPeriods(records, zone, now) }
                val period = periodResult.getOrNull()?.get(day)
                check(permission in hc.permissionController.getGrantedPermissions()) { "Steps access changed. Review permissions and check again." }
                val lines = mutableListOf(
                    "EZPZ step check v2", "Checked: $now", "Day: $day", "Phone zone: $zone",
                    "Source filter: com.whoop.android only", "Local window: $start to $end",
                    "Health Connect local-day steps: ${localTotal ?: "unavailable"}",
                    "Health Connect UTC-day steps: ${utcTotal ?: "unavailable"}",
                    "Health Connect recorded-local-date steps: ${storedDateTotal ?: "unavailable"}",
                    "WHOOP reporting-period steps: ${period?.count ?: "unavailable"}",
                    "Reporting-period check: ${if (periodResult.isFailure) "ambiguous; no import" else if (periodResult.getOrNull() == null) "short records; calendar aggregation" else "whole record on local ending date"}",
                    "WHOOP raw records in surrounding window: ${records.size}",
                    "Raw record counts below are unsplit record sums, NOT daily totals."
                )
                for ((label, group) in records.groupBy { StepDays.recordDate(it.startTime, null, zone) }.toSortedMap())
                    lines.add("By record start on phone: $label / ${group.size} records / ${group.sumOf { it.count }} raw steps")
                for ((label, group) in records.groupBy { StepDays.recordDate(it.startTime, it.startZoneOffset, zone) }.toSortedMap())
                    lines.add("By record start with supplied offset: $label / ${group.size} records / ${group.sumOf { it.count }} raw steps")
                val relevant = records.filter { it.startTime < end && it.endTime > start }
                lines.add("Records overlapping local day: ${relevant.size}")
                val examples = relevant.sortedByDescending { Duration.between(it.startTime, it.endTime) }.take(8)
                for (r in examples) lines.add("Record: ${r.count} steps / ${r.startTime} to ${r.endTime} / offsets ${r.startZoneOffset ?: "missing"}, ${r.endZoneOffset ?: "missing"} / updated ${r.metadata.lastModifiedTime}")
                lines.add("No device records were changed. No phone-counted steps were included.")
                call.resolve(JSObject().put("date", day.toString()).put("total", (if (periodResult.getOrNull() != null) period?.count else localTotal) ?: org.json.JSONObject.NULL).put("text", lines.joinToString("\n")))
            } catch (e: Exception) { call.reject(if (e is SecurityException) "Allow EZPZ Steps access, then check again." else e.message ?: "Step check failed. Your records were kept.") }
        }
    }
    /** Inspect calories without importing or changing records; aggregates can differ from raw entries. */
    @PluginMethod fun checkCalories(call: PluginCall) {
        scope.launch {
            try {
                val hc = client()
                val zone = ZoneId.systemDefault()
                val now = Instant.now()
                val today = now.atZone(zone).toLocalDate()
                val day = LocalDate.parse(call.getString("date") ?: today.minusDays(1).toString())
                check(day >= today.minusDays(6) && day <= today) { "Choose a date in the last seven days." }
                val permissions = hc.permissionController.getGrantedPermissions()
                val totalPermission = HealthPermission.getReadPermission(TotalCaloriesBurnedRecord::class)
                val activePermission = HealthPermission.getReadPermission(ActiveCaloriesBurnedRecord::class)
                val allowed = setOf(totalPermission, activePermission).intersect(permissions)
                check(allowed.isNotEmpty()) { "Allow EZPZ calorie read access first." }
                val (start, dayEnd) = StepDays.bounds(day, zone)
                val end = minOf(dayEnd, now)
                val range = TimeRangeFilter.between(start, end)
                val readStart = start.minus(Duration.ofDays(2))
                val readEnd = minOf(dayEnd.plus(Duration.ofDays(1)), now)
                val lines = mutableListOf("EZPZ calorie check v1", "Checked: $now", "Day: $day", "Phone zone: $zone",
                    "Source filter: com.whoop.android only", "Local window: $start to $end", "Raw window: $readStart to $readEnd")
                fun kcal(value: Double?) = value?.let { String.format(java.util.Locale.ROOT, "%.3f", it) } ?: "unavailable"
                if (totalPermission in allowed) {
                    val aggregate = hc.aggregate(AggregateRequest(setOf(TotalCaloriesBurnedRecord.ENERGY_TOTAL), range, origin))
                    lines.add("Health Connect local-day total kcal: ${kcal(aggregate[TotalCaloriesBurnedRecord.ENERGY_TOTAL]?.inKilocalories)}")
                    val utcStart=day.atStartOfDay(ZoneOffset.UTC).toInstant()
                    val utcEnd=minOf(day.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant(),now)
                    val utc=hc.aggregate(AggregateRequest(setOf(TotalCaloriesBurnedRecord.ENERGY_TOTAL),TimeRangeFilter.between(utcStart,utcEnd),origin))
                    lines.add("Health Connect UTC-day total kcal: ${kcal(utc[TotalCaloriesBurnedRecord.ENERGY_TOTAL]?.inKilocalories)}")
                    val records=mutableListOf<TotalCaloriesBurnedRecord>()
                    var token: String?=null
                    do {
                        val page=hc.readRecords(ReadRecordsRequest(TotalCaloriesBurnedRecord::class,TimeRangeFilter.between(readStart,readEnd),dataOriginFilter=origin,pageSize=1000,pageToken=token))
                        records.addAll(page.records);token=page.pageToken?.takeIf { it.isNotBlank() }
                        check(records.size<=10000) { "Too many calorie records for a compact report. Saved records were kept." }
                    } while(token!=null)
                    lines.add("WHOOP raw total-calorie records in window: ${records.size}")
                    for((date,group) in records.groupBy { StepDays.recordDate(it.endTime.minusNanos(1),it.endZoneOffset,zone) }.toSortedMap())
                        lines.add("By total-record ending date: $date / ${group.size} records / ${kcal(group.sumOf { it.energy.inKilocalories })} raw kcal (unsplit; not a daily total)")
                    for(r in records.sortedByDescending { Duration.between(it.startTime,it.endTime) }.take(8))
                        lines.add("Total record: ${kcal(r.energy.inKilocalories)} kcal / ${r.startTime} to ${r.endTime} / offsets ${r.startZoneOffset}, ${r.endZoneOffset} / updated ${r.metadata.lastModifiedTime}")
                } else lines.add("Total-calorie access: not granted")
                if(activePermission in allowed) {
                    val aggregate=hc.aggregate(AggregateRequest(setOf(ActiveCaloriesBurnedRecord.ACTIVE_CALORIES_TOTAL),range,origin))
                    lines.add("Health Connect local-day active kcal: ${kcal(aggregate[ActiveCaloriesBurnedRecord.ACTIVE_CALORIES_TOTAL]?.inKilocalories)}")
                    val records=mutableListOf<ActiveCaloriesBurnedRecord>()
                    var token: String?=null
                    do {
                        val page=hc.readRecords(ReadRecordsRequest(ActiveCaloriesBurnedRecord::class,TimeRangeFilter.between(readStart,readEnd),dataOriginFilter=origin,pageSize=1000,pageToken=token))
                        records.addAll(page.records);token=page.pageToken?.takeIf { it.isNotBlank() }
                        check(records.size<=10000) { "Too many calorie records for a compact report. Saved records were kept." }
                    } while(token!=null)
                    lines.add("WHOOP raw active-calorie records in window: ${records.size}")
                    for((date,group) in records.groupBy { StepDays.recordDate(it.endTime.minusNanos(1),it.endZoneOffset,zone) }.toSortedMap())
                        lines.add("By active-record ending date: $date / ${group.size} records / ${kcal(group.sumOf { it.energy.inKilocalories })} raw kcal (unsplit; not a daily total)")
                    for(r in records.sortedByDescending { Duration.between(it.startTime,it.endTime) }.take(8))
                        lines.add("Active record: ${kcal(r.energy.inKilocalories)} kcal / ${r.startTime} to ${r.endTime} / offsets ${r.startZoneOffset}, ${r.endZoneOffset} / updated ${r.metadata.lastModifiedTime}")
                } else lines.add("Active-calorie access: not granted")
                check(hc.permissionController.getGrantedPermissions().containsAll(allowed)) { "Calorie access changed. Review permissions and check again." }
                lines.add("Aggregates and raw entries are reported separately. No BMR was read or estimated by EZPZ. No device records were changed.")
                call.resolve(JSObject().put("date",day.toString()).put("text",lines.joinToString("\n")))
            } catch(e: Exception) { call.reject(if(e is SecurityException) "Allow EZPZ calorie read access, then check again." else e.message ?: "Calorie check failed. Saved records were kept.") }
        }
    }
    @PluginMethod fun sync(call: PluginCall) {
        scope.launch {
            try {
                val hc = client()
                val source = call.getString("source") ?: "whoop-health-connect"
                val packageName = WearableSources.packageName(source)
                val origin = setOf(DataOrigin(packageName))
                val granted = hc.permissionController.getGrantedPermissions()
                val metrics = permissionMetrics.filterKeys { it in granted }.values.toSet()
                check(metrics.isNotEmpty()) { "Allow at least one EZPZ permission before syncing." }
                val zone = ZoneId.systemDefault()
                val now = Instant.now()
                val today = now.atZone(zone).toLocalDate()
                val first = today.minusDays(6)
                val rows = JSArray()
                val workouts = JSArray()
                fun add(metric: String, day: LocalDate, value: Number) {
                    rows.put(JSObject().put("metric", metric).put("date", day.toString())
                        .put("source", source).put("externalId", "$source-$metric-$day")
                        .put("unit", if (metric == "steps") "count" else if (metric == "sleep") "minutes" else "kcal")
                        .put("value", value).put("updatedAt", now.toString()))
                }
                val periods = if (source == "whoop-health-connect" && "steps" in metrics) stepPeriods(readWhoopSteps(hc,
                    first.minusDays(2).atStartOfDay(zone).toInstant(), now), zone, now) else null
                val rawTotals = mutableListOf<RawTotalCalories.Record>()
                if ("totalCalories" in metrics) {
                    var token: String? = null
                    do {
                        val page = hc.readRecords(ReadRecordsRequest(TotalCaloriesBurnedRecord::class,
                            TimeRangeFilter.between(first.minusDays(2).atStartOfDay(zone).toInstant(), now),
                            dataOriginFilter = origin, pageSize = 1000, pageToken = token))
                        rawTotals.addAll(page.records.map { RawTotalCalories.Record(it.startTime,it.endTime,it.energy.inKilocalories) })
                        token=page.pageToken?.takeIf { it.isNotBlank() }
                        check(rawTotals.size <= 10000) { "Too many calorie records. Saved records were kept." }
                    } while (token != null)
                }
                for (offset in 0L..6L) {
                    val day = first.plusDays(offset)
                    val (start, dayEnd) = StepDays.bounds(day, zone)
                    val end = minOf(dayEnd, now)
                    val range = TimeRangeFilter.between(start, end)
                    if ("steps" in metrics) {
                        if (periods != null) {
                            periods[day]?.let {
                                add("steps", day, it.count)
                                rows.getJSONObject(rows.length() - 1).put("stepBasis", "whoop-period")
                                    .put("periodStart", it.start.toString()).put("periodEnd", it.end.toString())
                            }
                        } else {
                            val r = hc.aggregate(AggregateRequest(setOf(StepsRecord.COUNT_TOTAL), range, origin))
                            r[StepsRecord.COUNT_TOTAL]?.let { add("steps", day, it) }
                        }
                    }
                    if ("activeCalories" in metrics) {
                        val r = hc.aggregate(AggregateRequest(setOf(ActiveCaloriesBurnedRecord.ACTIVE_CALORIES_TOTAL), range, origin))
                        r[ActiveCaloriesBurnedRecord.ACTIVE_CALORIES_TOTAL]?.let { add("activeCalories", day, it.inKilocalories) }
                    }
                    if ("totalCalories" in metrics) {
                        // Aggregate totals may exist without any WHOOP total-calorie record.
                        // Only explicit, complete, nonoverlapping raw totals can be imported.
                        RawTotalCalories.complete(rawTotals,start,end)?.let { add("totalCalories", day, it) }
                    }
                }
                if ("sleep" in metrics) {
                    val sessions = mutableListOf<SleepSessionRecord>()
                    var token: String? = null
                    do {
                        val page = hc.readRecords(ReadRecordsRequest(SleepSessionRecord::class,
                            TimeRangeFilter.between(first.minusDays(1).atStartOfDay(zone).toInstant(), now),
                            dataOriginFilter = origin, pageSize = 1000, pageToken = token))
                        sessions.addAll(page.records); token = page.pageToken?.takeIf { it.isNotBlank() }
                        check(sessions.size <= 10000) { "Too many sleep records. Try again with fewer records." }
                    } while (token != null)
                    val completed = sessions.filter { it.endTime <= now }.groupBy {
                        it.endTime.atOffset(it.endZoneOffset ?: zone.rules.getOffset(it.endTime)).toLocalDate()
                    }
                    for ((day, all) in completed) {
                        if (day < first || day > today) continue
                        fun interval(a: Instant, b: Instant) = a.toEpochMilli() to b.toEpochMilli()
                        val full = all.map { interval(it.startTime, it.endTime) }
                        val awake = all.flatMap { it.stages }.filter { it.stage in setOf(SleepSessionRecord.STAGE_TYPE_AWAKE, SleepSessionRecord.STAGE_TYPE_AWAKE_IN_BED, SleepSessionRecord.STAGE_TYPE_OUT_OF_BED) }.map { interval(it.startTime, it.endTime) }
                        val duration = SleepIntervals.minutes(full) - SleepIntervals.minutes(awake)
                        if (duration !in 0..1440) continue
                        add("sleep", day, duration)
                        val row = rows.getJSONObject(rows.length() - 1)
                        val stages = all.flatMap { it.stages }
                        val deep = SleepIntervals.reportedMinutes(stages.filter { it.stage == SleepSessionRecord.STAGE_TYPE_DEEP }.map { interval(it.startTime, it.endTime) })
                        val rem = SleepIntervals.reportedMinutes(stages.filter { it.stage == SleepSessionRecord.STAGE_TYPE_REM }.map { interval(it.startTime, it.endTime) })
                        val light = SleepIntervals.reportedMinutes(stages.filter { it.stage == SleepSessionRecord.STAGE_TYPE_LIGHT }.map { interval(it.startTime, it.endTime) })
                        if ((deep ?: 0) + (rem ?: 0) + (light ?: 0) <= duration) {
                            if (deep != null) row.put("deepMinutes", deep)
                            if (rem != null) row.put("remMinutes", rem)
                            if (light != null) row.put("lightMinutes", light)
                        }
                        val bedMinutes = SleepIntervals.minutes(full)
                        val awakeMinutes = SleepIntervals.reportedMinutes(awake)
                        if (bedMinutes in duration..1440) row.put("inBedMinutes", bedMinutes)
                        if (awakeMinutes != null && awakeMinutes in 0..1440) row.put("awakeMinutes", awakeMinutes)
                    }
                }
                if ("workouts" in metrics) {
                    var token: String? = null
                    var count = 0
                    do {
                        val page = hc.readRecords(ReadRecordsRequest(ExerciseSessionRecord::class,
                            TimeRangeFilter.between(first.minusDays(1).atStartOfDay(zone).toInstant(), now),
                            dataOriginFilter = origin, pageSize = 1000, pageToken = token))
                        count += page.records.size
                        check(count <= 10000) { "Too many workouts. Saved records were kept." }
                        for (r in page.records) {
                            val day = r.startTime.atOffset(r.startZoneOffset ?: zone.rules.getOffset(r.startTime)).toLocalDate()
                            if (day < first || day > today || r.endTime > now || r.endTime <= r.startTime || Duration.between(r.startTime, r.endTime) > Duration.ofDays(1)) continue
                            val title = r.title?.takeIf { it.isNotBlank() }?.take(80) ?: when(r.exerciseType) {
                                ExerciseSessionRecord.EXERCISE_TYPE_RUNNING -> "Running"
                                ExerciseSessionRecord.EXERCISE_TYPE_BIKING -> "Cycling"
                                ExerciseSessionRecord.EXERCISE_TYPE_WALKING -> "Walking"
                                ExerciseSessionRecord.EXERCISE_TYPE_STRENGTH_TRAINING -> "Strength training"
                                else -> "Workout"
                            }
                            workouts.put(JSObject().put("source", source).put("externalId", "hc-" + r.metadata.id)
                                .put("date", day.toString()).put("start", r.startTime.toString()).put("end", r.endTime.toString())
                                .put("durationMinutes", Duration.between(r.startTime, r.endTime).toMillis() / 60000.0)
                                .put("title", title).put("updatedAt", now.toString()))
                        }
                        token = page.pageToken?.takeIf { it.isNotBlank() }
                    } while (token != null)
                }
                // Permission loss during the read rejects the whole snapshot. Do not prune old data.
                check(hc.permissionController.getGrantedPermissions().containsAll(permissionMetrics.filterValues { it in metrics }.keys)) { "Permissions changed. Sync again after reviewing them." }
                call.resolve(JSObject().put("version", 1).put("records", rows).put("metrics", JSArray(metrics.toList()))
                    .put("from", first.toString()).put("through", today.toString()).put("source", source).put("workouts", workouts))
            } catch (e: Exception) { call.reject(if (e is SecurityException) "Health Connect permission was removed. Review access and try again." else e.message ?: "Sync failed. No records were changed.") }
        }
    }
    /** Nutrition is independent of the selected wearable reader. Never combine app origins. */
    private val nutritionPermission get() = HealthPermission.getReadPermission(NutritionRecord::class)
    @PluginMethod fun requestNutritionPermissions(call: PluginCall) {
        try {
            client()
            val intent = PermissionController.createRequestPermissionResultContract().createIntent(context, setOf(nutritionPermission))
            startActivityForResult(call, intent, "nutritionPermissionResult")
        } catch (_: Exception) { call.reject("Health Connect is unavailable. Install or update it in Android settings.") }
    }
    @ActivityCallback private fun nutritionPermissionResult(call: PluginCall?, result: ActivityResult) {
        if (call != null) call.resolve()
    }
    @PluginMethod fun syncNutrition(call: PluginCall) {
        scope.launch {
            try {
                val hc = client()
                check(nutritionPermission in hc.permissionController.getGrantedPermissions()) { "Allow EZPZ nutrition access first." }
                val now = Instant.now()
                val zone = ZoneId.systemDefault()
                val today = now.atZone(zone).toLocalDate()
                val first = today.minusDays(6)
                val records = mutableListOf<NutritionRecord>()
                var token: String? = null
                do {
                    val page = hc.readRecords(ReadRecordsRequest(NutritionRecord::class,
                        TimeRangeFilter.between(first.minusDays(1).atStartOfDay(zone).toInstant(), now), pageSize = 1000, pageToken = token))
                    records.addAll(page.records)
                    token = page.pageToken?.takeIf { it.isNotBlank() }
                    check(records.size <= 20000) { "Too many food records. Saved nutrition was kept." }
                } while (token != null)
                val rows = JSArray()
                // Food belongs to its recorded local start date. No splitting across midnight.
                val groups = records.filter { it.startTime <= now }.groupBy {
                    it.metadata.dataOrigin.packageName to it.startTime.atOffset(it.startZoneOffset ?: zone.rules.getOffset(it.startTime)).toLocalDate()
                }
                for ((key, group) in groups) {
                    val (source, day) = key
                    if (day < first || day > today) continue
                    fun total(values: List<Double?>): Any = if (values.any { it == null }) org.json.JSONObject.NULL else values.sumOf { it!! }
                    val macros = JSArray().put(total(group.map { it.energy?.inKilocalories }))
                        .put(total(group.map { it.protein?.inGrams })).put(total(group.map { it.totalCarbohydrate?.inGrams }))
                        .put(total(group.map { it.totalFat?.inGrams }))
                    rows.put(JSObject().put("source", source).put("date", day.toString()).put("macros", macros).put("updatedAt", now.toString()))
                }
                check(nutritionPermission in hc.permissionController.getGrantedPermissions()) { "Nutrition access changed. Saved nutrition was kept." }
                call.resolve(JSObject().put("version", 1).put("from", first.toString()).put("through", today.toString()).put("records", rows))
            } catch (e: Exception) { call.reject(if (e is SecurityException) "Review EZPZ nutrition permission and try again." else e.message ?: "Nutrition sync failed. Saved nutrition was kept.") }
        }
    }
    override fun handleOnDestroy() { scope.cancel(); super.handleOnDestroy() }
}
