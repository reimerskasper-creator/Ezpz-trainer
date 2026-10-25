package com.ezpz.fitness

import java.time.*

/** WHOOP's observed daily export is one ~24h interval, not midnight buckets.
 * Keep its count whole on the local ending date. Never sum overlapping summaries
 * or combine summaries with fine-grained data. Short-only exports use HC aggregation.
 */
object WhoopStepPeriods {
    data class Record(val start: Instant, val end: Instant, val offset: ZoneOffset?, val count: Long)

    fun daily(records: List<Record>, zone: ZoneId, now: Instant): Map<LocalDate, Record>? {
        val completed = records.filter { it.end <= now }.distinct()
        if (completed.none { Duration.between(it.start, it.end) >= Duration.ofHours(18) }) return null
        val error = "WHOOP step periods overlap or have an unfamiliar format. Saved records were kept. Copy the step report for review."
        check(completed.all { Duration.between(it.start, it.end) in Duration.ofHours(18)..Duration.ofHours(30) && it.count in 0L..200000L }) { error }
        val sorted = completed.sortedBy { it.start }
        check(sorted.zipWithNext().all { (a, b) -> a.end <= b.start }) { error }
        val groups = sorted.groupBy {
            // An interval ending exactly at midnight belongs to the date it covered.
            StepDays.recordDate(it.end.minusNanos(1), it.offset, zone)
        }
        check(groups.values.all { it.size == 1 }) { error }
        return groups.mapValues { it.value.single() }
    }
}
