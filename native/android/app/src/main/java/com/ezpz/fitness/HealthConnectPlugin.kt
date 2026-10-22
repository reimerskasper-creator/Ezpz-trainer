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

/** Explicit, read-only WHOOP snapshots. No worker, token, health upload or cross-source sum. */
@CapacitorPlugin(name = "EzpzHealthConnect")
class HealthConnectPlugin : Plugin() {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private val origin = setOf(DataOrigin("com.whoop.android"))
    private val permissionMetrics = linkedMapOf(
        HealthPermission.getReadPermission(StepsRecord::class) to "steps",
        HealthPermission.getReadPermission(SleepSessionRecord::class) to "sleep",
        HealthPermission.getReadPermission(ActiveCaloriesBurnedRecord::class) to "activeCalories",
        HealthPermission.getReadPermission(TotalCaloriesBurnedRecord::class) to "totalCalories"
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
    @PluginMethod fun sync(call: PluginCall) {
        scope.launch {
            try {
                val hc = client()
                val granted = hc.permissionController.getGrantedPermissions()
                val metrics = permissionMetrics.filterKeys { it in granted }.values.toSet()
                check(metrics.isNotEmpty()) { "Allow at least one EZPZ permission before syncing." }
                val zone = ZoneId.systemDefault()
                val now = Instant.now()
                val today = now.atZone(zone).toLocalDate()
                val first = today.minusDays(6)
                val rows = JSArray()
                fun add(metric: String, day: LocalDate, value: Number) {
                    rows.put(JSObject().put("metric", metric).put("date", day.toString())
                        .put("source", "whoop-health-connect").put("externalId", "whoop-hc-$metric-$day")
                        .put("unit", if (metric == "steps") "count" else if (metric == "sleep") "minutes" else "kcal")
                        .put("value", value).put("updatedAt", now.toString()))
                }
                for (offset in 0L..6L) {
                    val day = first.plusDays(offset)
                    val start = day.atStartOfDay(zone).toInstant()
                    val end = minOf(day.plusDays(1).atStartOfDay(zone).toInstant(), now)
                    val range = TimeRangeFilter.between(start, end)
                    if ("steps" in metrics) {
                        val r = hc.aggregate(AggregateRequest(setOf(StepsRecord.COUNT_TOTAL), range, origin))
                        r[StepsRecord.COUNT_TOTAL]?.let { add("steps", day, it) }
                    }
                    if ("activeCalories" in metrics) {
                        val r = hc.aggregate(AggregateRequest(setOf(ActiveCaloriesBurnedRecord.ACTIVE_CALORIES_TOTAL), range, origin))
                        r[ActiveCaloriesBurnedRecord.ACTIVE_CALORIES_TOTAL]?.let { add("activeCalories", day, it.inKilocalories) }
                    }
                    if ("totalCalories" in metrics) {
                        val r = hc.aggregate(AggregateRequest(setOf(TotalCaloriesBurnedRecord.ENERGY_TOTAL), range, origin))
                        r[TotalCaloriesBurnedRecord.ENERGY_TOTAL]?.let { add("totalCalories", day, it.inKilocalories) }
                    }
                }
                if ("sleep" in metrics) {
                    val sessions = mutableListOf<SleepSessionRecord>()
                    var token: String? = null
                    do {
                        val page = hc.readRecords(ReadRecordsRequest(SleepSessionRecord::class,
                            TimeRangeFilter.between(first.minusDays(1).atStartOfDay(zone).toInstant(), now),
                            dataOriginFilter = origin, pageSize = 1000, pageToken = token))
                        sessions.addAll(page.records); token = page.pageToken
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
                        val deep = SleepIntervals.minutes(stages.filter { it.stage == SleepSessionRecord.STAGE_TYPE_DEEP }.map { interval(it.startTime, it.endTime) })
                        val rem = SleepIntervals.minutes(stages.filter { it.stage == SleepSessionRecord.STAGE_TYPE_REM }.map { interval(it.startTime, it.endTime) })
                        if (stages.isNotEmpty() && deep + rem <= duration) { row.put("deepMinutes", deep); row.put("remMinutes", rem) }
                    }
                }
                // Permission loss during the read rejects the whole snapshot. Do not prune old data.
                check(hc.permissionController.getGrantedPermissions().containsAll(permissionMetrics.filterValues { it in metrics }.keys)) { "Permissions changed. Sync again after reviewing them." }
                call.resolve(JSObject().put("version", 1).put("records", rows).put("metrics", JSArray(metrics.toList()))
                    .put("from", first.toString()).put("through", today.toString()))
            } catch (e: Exception) { call.reject(if (e is SecurityException) "Health Connect permission was removed. Review access and try again." else e.message ?: "Sync failed. No records were changed.") }
        }
    }
    override fun handleOnDestroy() { scope.cancel(); super.handleOnDestroy() }
}
