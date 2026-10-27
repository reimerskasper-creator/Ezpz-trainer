package com.ezpz.fitness

import org.junit.Assert.*
import org.junit.Test

class WearableSourcesTest {
    @Test fun selectedTrackerResolvesToOnePublisherOrigin() {
        assertEquals(9, WearableSources.packages.size)
        assertEquals(9, WearableSources.packages.values.toSet().size)
        for ((source, packageName) in WearableSources.packages) {
            assertEquals(packageName, WearableSources.packageName(source))
            assertTrue(source.endsWith("-health-connect"))
            assertTrue(packageName.contains('.'))
        }
        assertEquals("com.whoop.android", WearableSources.packageName("whoop-health-connect"))
        assertEquals("com.garmin.android.apps.connectmobile", WearableSources.packageName("garmin-health-connect"))
    }
    @Test fun unknownSourceCannotBecomeAnUnfilteredOrArbitraryPackageRead() {
        for (source in listOf("", "all", "health-connect", "com.whoop.android", "garmin", "garmin-health-connect ")) {
            try { WearableSources.packageName(source); fail("Unexpected origin: $source") }
            catch (_: IllegalArgumentException) { }
        }
    }
}
