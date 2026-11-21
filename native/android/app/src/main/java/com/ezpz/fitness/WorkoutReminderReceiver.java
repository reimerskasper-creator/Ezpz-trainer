package com.ezpz.fitness;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import org.json.JSONArray;
import org.json.JSONObject;
import java.text.ParsePosition;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class WorkoutReminderReceiver extends BroadcastReceiver {
    static final String OPEN = "com.ezpz.fitness.OPEN_WORKOUT_REMINDER";
    private static final String FIRE = "com.ezpz.fitness.FIRE_WORKOUT_REMINDER";
    private static final String CHANNEL = "workout_reminders";

    private static JSONArray saved(Context context) {
        try {
            return new JSONArray(context.getSharedPreferences(CHANNEL, Context.MODE_PRIVATE)
                .getString("reminders", "[]"));
        } catch (Exception ignored) {
            return new JSONArray();
        }
    }

    private static long due(JSONObject item) {
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm", Locale.US);
        format.setLenient(false);
        Date date = format.parse(item.optString("when"), new ParsePosition(0));
        return date == null ? -1 : date.getTime();
    }

    private static String key(JSONObject item) {
        return item.optString("date") + "/" + item.optString("slot");
    }

    private static JSONObject find(JSONArray items, String key) {
        for (int i = 0; i < items.length(); i++) {
            JSONObject item = items.optJSONObject(i);
            if (item != null && key(item).equals(key)) return item;
        }
        return null;
    }

    static boolean replace(Context context, JSONArray items) {
        JSONArray previous = saved(context);
        if (!context.getSharedPreferences(CHANNEL, Context.MODE_PRIVATE).edit()
            .putString("reminders", items.toString()).commit()) return false;
        NotificationManagerCompat notifications = NotificationManagerCompat.from(context);
        for (int i = 0; i < previous.length(); i++) {
            JSONObject item = previous.optJSONObject(i);
            if (item == null) continue;
            JSONObject current = find(items, key(item));
            if (current == null || !current.toString().equals(item.toString())) {
                notifications.cancel(key(item), 1);
            }
        }
        schedule(context, items);
        return true;
    }

    private static void schedule(Context context, JSONArray items) {
        long now = System.currentTimeMillis(), next = Long.MAX_VALUE;
        for (int i = 0; i < items.length(); i++) {
            JSONObject item = items.optJSONObject(i);
            if (item == null) continue;
            long time = due(item);
            if (time > now) next = Math.min(time, next);
        }
        AlarmManager alarms = context.getSystemService(AlarmManager.class);
        Intent intent = new Intent(context, WorkoutReminderReceiver.class).setAction(FIRE);
        intent.putExtra("due", next);
        PendingIntent alarm = PendingIntent.getBroadcast(context, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        if (next == Long.MAX_VALUE) alarms.cancel(alarm);
        else alarms.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, next, alarm);
    }

    @Override public void onReceive(Context context, Intent intent) {
        JSONArray items = saved(context);
        if (FIRE.equals(intent.getAction())) {
            long scheduled = intent.getLongExtra("due", Long.MAX_VALUE);
            long now = System.currentTimeMillis();
            for (int i = 0; i < items.length(); i++) {
                JSONObject item = items.optJSONObject(i);
                if (item == null) continue;
                long time = due(item);
                if (time >= scheduled && time <= now && now - time < 6 * 3600000L) {
                    notifyWorkout(context, item);
                }
            }
        }
        schedule(context, items);
    }

    private static void notifyWorkout(Context context, JSONObject item) {
        NotificationManagerCompat manager = NotificationManagerCompat.from(context);
        if (!manager.areNotificationsEnabled()) return;
        if (Build.VERSION.SDK_INT >= 26) {
            context.getSystemService(NotificationManager.class).createNotificationChannel(
                new NotificationChannel(CHANNEL, "Workout reminders", NotificationManager.IMPORTANCE_DEFAULT));
        }
        Intent open = new Intent(context, MainActivity.class).setAction(OPEN)
            .setData(Uri.parse("ezpzfitness://reminder/" + key(item)))
            .putExtra("workoutReminder", item.toString());
        PendingIntent action = PendingIntent.getActivity(context, 0, open,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        String today = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
        boolean tomorrow = item.optString("mode").equals("before") && item.optString("when").startsWith(today);
        NotificationCompat.Builder notification = new NotificationCompat.Builder(context, CHANNEL)
            .setSmallIcon(R.drawable.ic_workout_reminder)
            .setContentTitle(tomorrow ? "Workout tomorrow" : "Workout today")
            .setContentText(item.optString("title") + " is on your plan.")
            .setVisibility(NotificationCompat.VISIBILITY_PRIVATE)
            .setAutoCancel(true).setContentIntent(action)
            .addAction(0, "View workout", action);
        try {
            manager.notify(key(item), 1, notification.build());
        } catch (SecurityException ignored) {
            // Notification permission can be withdrawn between checking and posting.
        }
    }
}
