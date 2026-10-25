package com.ezpz.fitness
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
class SleepIntervalsTest {
    @Test fun absentStagesAreUnavailable() {
        assertNull(SleepIntervals.reportedMinutes(emptyList()))
        assertNull(SleepIntervals.reportedMinutes(listOf(0L to 0L)))
        assertEquals(0, SleepIntervals.reportedMinutes(listOf(0L to 10000L)))
        assertEquals(83, SleepIntervals.reportedMinutes(listOf(0L to 4980000L)))
    }
    @Test fun duplicatesAndOverlapDoNotAddSleep() {
        assertEquals(3, SleepIntervals.minutes(listOf(0L to 120000L, 60000L to 180000L, 0L to 120000L)))
    }
    @Test fun napsAndMissingIntervals() {
        assertEquals(2, SleepIntervals.minutes(listOf(0L to 60000L, 120000L to 180000L)))
        assertEquals(0, SleepIntervals.minutes(emptyList()))
    }
}
