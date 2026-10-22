package com.ezpz.fitness
import java.time.*
/** Calendar boundaries use the phone's zone, including daylight-saving days. */
object StepDays {
    fun bounds(day: LocalDate, zone: ZoneId): Pair<Instant, Instant> =
        day.atStartOfDay(zone).toInstant() to day.plusDays(1).atStartOfDay(zone).toInstant()
    fun recordDate(start: Instant, offset: ZoneOffset?, fallback: ZoneId): LocalDate =
        if (offset == null) start.atZone(fallback).toLocalDate() else start.atOffset(offset).toLocalDate()
}
