package com.ezpz.fitness;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Intent;
import android.os.Build;
import androidx.core.app.NotificationManagerCompat;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(name = "EzpzWorkoutReminder", permissions = {
    @Permission(alias = "notifications", strings = {Manifest.permission.POST_NOTIFICATIONS})
})
public class WorkoutReminderPlugin extends Plugin {
    private JSObject pending;

    @Override public void load() {
        readIntent(getActivity().getIntent());
    }

    @Override protected void handleOnNewIntent(Intent intent) {
        readIntent(intent);
    }

    private void readIntent(Intent intent) {
        if (intent == null || !WorkoutReminderReceiver.OPEN.equals(intent.getAction())) return;
        String json = intent.getStringExtra("workoutReminder");
        intent.removeExtra("workoutReminder");
        if (json == null || json.length() > 2048) return;
        try {
            JSObject item = new JSObject(json);
            if (hasListeners("openWorkout")) notifyListeners("openWorkout", item);
            else pending = item;
        } catch (Exception ignored) {
            // An invalid link cannot open a workout.
        }
    }

    @PluginMethod public void getPending(PluginCall call) {
        JSObject item = pending;
        pending = null;
        call.resolve(item == null ? new JSObject() : item);
    }

    @PluginMethod public void enable(PluginCall call) {
        if (Build.VERSION.SDK_INT >= 33 && getPermissionState("notifications") != com.getcapacitor.PermissionState.GRANTED) {
            requestPermissionForAlias("notifications", call, "permissionResult");
        } else {
            permissionResult(call);
        }
    }

    @PermissionCallback private void permissionResult(PluginCall call) {
        boolean enabled = NotificationManagerCompat.from(getContext()).areNotificationsEnabled();
        if (enabled && Build.VERSION.SDK_INT >= 26) {
            NotificationChannel channel = getContext().getSystemService(NotificationManager.class)
                .getNotificationChannel("workout_reminders");
            enabled = channel == null || channel.getImportance() != NotificationManager.IMPORTANCE_NONE;
        }
        JSObject result = new JSObject();
        result.put("enabled", enabled);
        call.resolve(result);
    }

    @PluginMethod public void sync(PluginCall call) {
        JSArray items = call.getArray("items");
        getActivity().runOnUiThread(() -> {
            try {
                if (items != null && WorkoutReminderReceiver.replace(getContext(), items)) {
                    call.resolve();
                    return;
                }
            } catch (RuntimeException ignored) {
                // Report scheduling problems to the editor so the user can retry.
            }
            call.reject("Could not save workout reminders.");
        });
    }
}
