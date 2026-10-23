package com.ezpz.fitness
import java.time.*
import org.junit.Assert.assertEquals
import org.junit.Test
class StepDaysTest {
    private val zone = ZoneId.of("America/New_York")
    @Test fun localDayDoesNotUseUtcMidnight() {
        val (start, end) = StepDays.bounds(LocalDate.parse("2026-10-21"), zone)
        assertEquals(Instant.parse("2026-10-21T04:00:00Z"), start)
        assertEquals(Instant.parse("2026-10-22T04:00:00Z"), end)
    }
    @Test fun daylightSavingDaysHaveRealLengths() {
        for ((date, hours) in listOf("2026-03-08" to 23L, "2026-11-01" to 25L)) {
            val (start, end) = StepDays.bounds(LocalDate.parse(date), zone)
            assertEquals(hours, Duration.between(start, end).toHours())
        }
    }
    @Test fun recordOffsetMayAssignAnotherDate() {
        val instant=Instant.parse("2026-10-22T01:00:00Z")
        assertEquals(LocalDate.parse("2026-10-21"), StepDays.recordDate(instant, null, zone))
        assertEquals(LocalDate.parse("2026-10-22"), StepDays.recordDate(instant, ZoneOffset.UTC, zone))
    }
}
