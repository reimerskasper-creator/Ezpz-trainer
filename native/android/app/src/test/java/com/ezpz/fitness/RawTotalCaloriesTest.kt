package com.ezpz.fitness

import java.time.Instant
import org.junit.Assert.*
import org.junit.Test

class RawTotalCaloriesTest {
    private val start = Instant.parse("2026-10-20T04:00:00Z")
    private val end = Instant.parse("2026-10-21T04:00:00Z")
    private val full = RawTotalCalories.Record(start,end,2274.0)
    @Test fun noWhoopRawTotalMeansMissingDespiteNonzeroAggregate() {
        // Phone report: aggregate 2608.2169 but zero WHOOP total records.
        assertNull(RawTotalCalories.complete(emptyList(),start,end))
    }
    @Test fun completeRawTotalsPreserveFractionalEnergyAndMeasuredZero() {
        assertEquals(2274.0, RawTotalCalories.complete(listOf(full),start,end)!!,0.001)
        assertEquals(0.0, RawTotalCalories.complete(listOf(full.copy(kcal=0.0)),start,end)!!,0.001)
        val mid=start.plusSeconds(3600)
        assertEquals(2274.125,RawTotalCalories.complete(listOf(full.copy(end=mid,kcal=100.125),full.copy(start=mid,kcal=2174.0)),start,end)!!,0.0001)
    }
    @Test fun exactDuplicatesAreNotAddedTwice() {
        assertEquals(2274.0,RawTotalCalories.complete(listOf(full,full),start,end)!!,0.001)
    }
    @Test fun gapsOverlapsAndBoundaryStraddlingRemainMissing() {
        for(records in listOf(listOf(full.copy(start=start.plusSeconds(1))),listOf(full.copy(end=end.minusSeconds(1))),listOf(full,full.copy(kcal=100.0)),listOf(full.copy(start=start.minusSeconds(1))),listOf(full.copy(end=end.plusSeconds(1)))))
            assertNull(RawTotalCalories.complete(records,start,end))
    }
}
