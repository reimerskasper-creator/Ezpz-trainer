package com.ezpz.fitness

import android.app.Activity
import android.content.Intent
import android.provider.OpenableColumns
import androidx.activity.result.ActivityResult
import com.getcapacitor.*
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.ActivityCallback
import kotlinx.coroutines.*
import org.json.JSONObject

/** User-selected SAF document only. No storage permission, automatic upload or data mutation. */
@CapacitorPlugin(name = "EzpzBackup")
class BackupPlugin : Plugin() {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private var busy = false
    @PluginMethod fun exportBackup(call: PluginCall) {
        if (busy) { call.reject("A backup save is already open."); return }
        try {
            val json = call.getString("json") ?: error("Missing backup data")
            check(json.toByteArray(Charsets.UTF_8).size <= 16000000) { "Backup exceeds the Android export limit." }
            val data = JSONObject(json)
            check(data.optJSONArray("logs") != null && data.optJSONArray("weights") != null) { "Invalid EZPZ backup data" }
            busy = true
            val intent = Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
                addCategory(Intent.CATEGORY_OPENABLE)
                type = "application/json"
                putExtra(Intent.EXTRA_TITLE, "ezpz-fitness-backup.json")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
            }
            startActivityForResult(call, intent, "backupDestination")
        } catch (_: Exception) { busy = false; call.reject("Could not open backup save. Your app data was kept.") }
    }
    @PluginMethod fun exportPlan(call: PluginCall) {
        if (busy) { call.reject("A file save is already open."); return }
        try {
            val json = call.getString("json") ?: error("Missing plan data")
            check(json.toByteArray(Charsets.UTF_8).size <= 2000000) { "Plan exceeds the export limit." }
            val data = JSONObject(json)
            check(data.optString("format") == "ezpz-plan" && data.optInt("version") in 1..2 && data.optJSONArray("entries") != null) { "Invalid EZPZ plan" }
            check(!data.has("logs") && !data.has("weights") && !data.has("profile")) { "Personal backup is not a plan" }
            val fileName = call.getString("fileName") ?: "ezpz-plan-my-plan.json"
            check(Regex("ezpz-plan-[a-z0-9-]{0,60}\\.json").matches(fileName)) { "Invalid plan filename" }
            busy = true
            val intent = Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
                addCategory(Intent.CATEGORY_OPENABLE)
                type = "application/json"
                putExtra(Intent.EXTRA_TITLE, fileName)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
            }
            startActivityForResult(call, intent, "backupDestination")
        } catch (_: Exception) { busy = false; call.reject("Could not open plan save. Your app data was kept.") }
    }
    @ActivityCallback private fun backupDestination(call: PluginCall?, result: ActivityResult) {
        if (call == null) { busy = false; return }
        if (result.resultCode != Activity.RESULT_OK) {
            busy = false; call.resolve(JSObject().put("saved",false).put("cancelled",true)); return
        }
        val uri = result.data?.data
        if (uri == null || uri.scheme != "content") {
            busy = false; call.reject("No backup destination was selected. Your app data was kept."); return
        }
        scope.launch {
            try {
                val json = call.getString("json") ?: error("Backup data is no longer available")
                val saved = withContext(Dispatchers.IO) {
                    val resolver = context.contentResolver
                    val bytes = json.toByteArray(Charsets.UTF_8)
                    val size = BackupFile.save(bytes, { resolver.openOutputStream(uri,"wt") }, { resolver.openInputStream(uri) })
                    var name = call.getString("fileName") ?: "ezpz-fitness-backup.json"
                    try {
                        resolver.query(uri,arrayOf(OpenableColumns.DISPLAY_NAME),null,null,null)?.use {
                            if (it.moveToFirst()) name = it.getString(0) ?: name
                        }
                    } catch (_: Exception) { /* Name lookup is optional; file bytes were verified. */ }
                    JSObject().put("saved",true).put("verified",true).put("bytes",size).put("fileName",name)
                }
                call.resolve(saved)
            } catch (_: Exception) {
                call.reject("Backup could not be saved and verified. Try a local Downloads folder. Your app data was kept.")
            } finally { busy = false }
        }
    }
    override fun handleOnDestroy() { scope.cancel(); super.handleOnDestroy() }
}
