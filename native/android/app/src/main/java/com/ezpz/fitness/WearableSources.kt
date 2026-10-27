package com.ezpz.fitness

/** Only the chosen companion app may contribute to an activity snapshot.
 * Packages verified against the publishers' Google Play listings (27 October 2026).
 * Never fall back to all origins: that would include phone counts and copied workouts.
 */
object WearableSources {
    val packages = linkedMapOf(
        "whoop-health-connect" to "com.whoop.android",
        "samsung-health-connect" to "com.sec.android.app.shealth",
        "fitbit-health-connect" to "com.fitbit.FitbitMobile",
        "garmin-health-connect" to "com.garmin.android.apps.connectmobile",
        "oura-health-connect" to "com.ouraring.oura",
        "polar-health-connect" to "fi.polar.polarflow",
        "amazfit-health-connect" to "com.huami.watch.hmwatchmanager",
        "xiaomi-health-connect" to "com.xiaomi.wearable",
        "withings-health-connect" to "com.withings.wiscale2"
    )
    fun packageName(source: String): String = requireNotNull(packages[source]) { "Choose a supported activity tracker in EZPZ." }
}
