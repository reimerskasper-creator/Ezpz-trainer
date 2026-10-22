package com.ezpz.fitness

import java.time.*
import org.junit.Assert.*
import org.junit.Test

class WhoopStepPeriodsTest {
    private val zone = ZoneId.of("America/New_York")
    private val now = Instant.parse("2026-10-22T19:49:49Z")
    private val observed = WhoopStepPeriods.Record(Instant.parse("2026-10-21T02:16:35.760Z"), Instant.parse("2026-10-22T02:07:37.990Z"), ZoneOffset.ofHours(-4), 8061)
    @Test fun observedExportKeepsWhoopTotalOnWednesday() {
        val result = WhoopStepPeriods.daily(listOf(observed), zone, now)!!
        assertEquals(setOf(LocalDate.parse("2026-10-21")), result.keys)
        assertEquals(8061L, result.values.single().count)
        assertNull(result[LocalDate.parse("2026-10-22")])
    }
    @Test fun duplicatesDoNotDoubleCountAndRevisionsReplaceOnNextRead() {
        assertEquals(8061L, WhoopStepPeriods.daily(listOf(observed, observed), zone, now)!!.values.single().count)
        assertEquals(8100L, WhoopStepPeriods.daily(listOf(observed.copy(count=8100)), zone, now)!!.values.single().count)
    }
    @Test fun shortRecordsKeepHealthConnectAggregation() {
        assertNull(WhoopStepPeriods.daily(listOf(observed.copy(start=observed.end.minusSeconds(60))), zone, now))
        assertNull(WhoopStepPeriods.daily(emptyList(), zone, now))
    }
    @Test fun midnightUsesCoveredDateAndOffsetSurvivesTravel() {
        val end = Instant.parse("2026-10-22T04:00:00Z")
        val r = observed.copy(start=end.minusSeconds(86400), end=end)
        assertEquals(LocalDate.parse("2026-10-21"), WhoopStepPeriods.daily(listOf(r), ZoneId.of("Asia/Tokyo"), now)!!.keys.single())
    }
    @Test fun futureExportsStayMissing() {
        assertNull(WhoopStepPeriods.daily(listOf(observed.copy(end=now.plusSeconds(1))), zone, now))
    }
    @Test fun multipleDaysStaySeparate() {
        val prior=observed.copy(start=observed.start.minusSeconds(86400), end=observed.start, count=12038)
        val result=WhoopStepPeriods.daily(listOf(observed, prior), zone, now)!!
        assertEquals(12038L, result[LocalDate.parse("2026-10-20")]!!.count)
        assertEquals(8061L, result[LocalDate.parse("2026-10-21")]!!.count)
    }
    @Test fun ambiguousExportsFailWithoutGuessing() {
        for (records in listOf(
            listOf(observed, observed.copy(count=9000)),
            listOf(observed, observed.copy(start=observed.end.minusSeconds(60))),
            listOf(observed.copy(start=observed.end.minusSeconds(31*3600))),
            listOf(observed, observed.copy(start=observed.start.plusSeconds(60), end=observed.end.plusSeconds(60)))
        )) {
            try { WhoopStepPeriods.daily(records, zone, now); fail("Ambiguous exports must reject") }
            catch (_: IllegalStateException) { }
        }
    }
}
