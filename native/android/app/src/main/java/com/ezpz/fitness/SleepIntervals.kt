package com.ezpz.fitness

/** Union intervals before adding; overlapping or duplicated sessions never double-count. */
object SleepIntervals {
    fun minutes(input: List<Pair<Long, Long>>): Int {
        val sorted = input.filter { it.second > it.first }.sortedBy { it.first }
        if (sorted.isEmpty()) return 0
        var start = sorted[0].first; var end = sorted[0].second; var millis = 0L
        for ((a, b) in sorted.drop(1)) {
            if (a <= end) end = maxOf(end, b)
            else { millis += end - start; start = a; end = b }
        }
        return ((millis + end - start) / 60000L).toInt()
    }
}
