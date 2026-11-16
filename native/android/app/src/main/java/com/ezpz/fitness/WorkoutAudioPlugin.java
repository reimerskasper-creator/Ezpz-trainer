package com.ezpz.fitness;

import android.media.AudioManager;
import android.media.ToneGenerator;
import android.os.Handler;
import android.os.Looper;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "EzpzWorkoutAudio")
public class WorkoutAudioPlugin extends Plugin {
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable restComplete = () -> play(true);
    private ToneGenerator tones;

    @PluginMethod public void workoutStarted(PluginCall call) {
        handler.post(() -> play(false));
        call.resolve();
    }

    @PluginMethod public void setRestDeadline(PluginCall call) {
        long deadline = (long) call.getDouble("endsAt", 0.0).doubleValue();
        handler.post(() -> {
            handler.removeCallbacks(restComplete);
            long delay = deadline - System.currentTimeMillis();
            if (delay > 0 && delay <= 600_000) handler.postDelayed(restComplete, delay);
        });
        call.resolve();
    }

    private void play(boolean restFinished) {
        try {
            if (tones == null) tones = new ToneGenerator(AudioManager.STREAM_MUSIC, 65);
            tones.startTone(restFinished ? ToneGenerator.TONE_PROP_ACK : ToneGenerator.TONE_PROP_BEEP, -1);
        } catch (RuntimeException ignored) {
            // The visible timer keeps running if the device has no audio output.
        }
    }

    @Override protected void handleOnDestroy() {
        handler.removeCallbacksAndMessages(null);
        if (tones != null) tones.release();
        tones = null;
        super.handleOnDestroy();
    }
}
