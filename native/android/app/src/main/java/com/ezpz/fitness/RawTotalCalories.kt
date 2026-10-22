package com.ezpz.fitness

import java.time.Instant

/** A daily total must be backed entirely by WHOOP raw records. No aggregate fallback,
 * gap filling, overlapping sums or invented distribution across a day boundary.
 */
object RawTotalCalories {
    data class Record(val start: Instant, val end: Instant, val kcal: Double)
    fun complete(records: List<Record>, start: Instant, end: Instant): Double? {
        if (end <= start) return null
        val relevant = records.filter { it.start < end && it.end > start }.distinct().sortedBy { it.start }
        if (relevant.isEmpty()) return null
        var cursor = start
        var total = 0.0
        for (r in relevant) {
            if (r.start != cursor || r.end <= r.start || r.end > end || !r.kcal.isFinite() || r.kcal < 0) return null
            total += r.kcal
            cursor = r.end
        }
        return total.takeIf { cursor == end && it.isFinite() && it <= 30000 }
    }
}
