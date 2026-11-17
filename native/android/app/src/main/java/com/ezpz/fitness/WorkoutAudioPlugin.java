package com.ezpz.fitness;

import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.ToneGenerator;
import android.os.Handler;
import android.os.Looper;
import android.speech.tts.TextToSpeech;
import android.speech.tts.Voice;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@CapacitorPlugin(name = "EzpzWorkoutAudio")
public class WorkoutAudioPlugin extends Plugin {
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable restComplete = () -> play(ToneGenerator.TONE_PROP_ACK, 350);
    private Runnable restWarning;
    private ToneGenerator tones;
    private TextToSpeech speech;
    private boolean speechReady;
    private String speakingCue;

    @Override public void load() {
        speech = new TextToSpeech(getContext(), status -> handler.post(() -> {
            if (speech == null || status != TextToSpeech.SUCCESS) return;
            speech.setAudioAttributes(new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_MEDIA)
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build());
            speech.setLanguage(Locale.US);
            speech.setSpeechRate(1.05f);
            speechReady = true;
        }));
    }

    private List<Voice> offlineEnglishVoices() {
        List<Voice> voices = new ArrayList<>();
        if (speechReady && speech.getVoices() != null) {
            for (Voice voice : speech.getVoices()) {
                if ("en".equals(voice.getLocale().getLanguage())
                    && !voice.isNetworkConnectionRequired()
                    && (voice.getFeatures() == null
                        || !voice.getFeatures().contains(TextToSpeech.Engine.KEY_FEATURE_NOT_INSTALLED))) {
                    voices.add(voice);
                }
            }
        }
        voices.sort(Comparator.comparing(voice -> voice.getLocale().toLanguageTag() + voice.getName()));
        return voices;
    }

    @PluginMethod public void getVoices(PluginCall call) {
        handler.post(() -> {
            JSArray choices = new JSArray();
            for (Voice voice : offlineEnglishVoices()) {
                JSObject choice = new JSObject();
                choice.put("id", voice.getName());
                choice.put("locale", voice.getLocale().toLanguageTag());
                choices.put(choice);
            }
            JSObject result = new JSObject();
            result.put("voices", choices);
            call.resolve(result);
        });
    }

    @PluginMethod public void previewRestVoice(PluginCall call) {
        String voice = call.getString("voice", "");
        handler.post(() -> {
            if (speechReady && "rest".equals(speakingCue) && speech.isSpeaking()) return;
            playWarning(voice, "preview");
        });
        call.resolve();
    }

    @PluginMethod public void setRestDeadline(PluginCall call) {
        long deadline = call.getDouble("endsAt", 0.0).longValue();
        String voice = call.getString("voice", "");
        handler.post(() -> {
            handler.removeCallbacks(restComplete);
            if (restWarning != null) handler.removeCallbacks(restWarning);
            stopSpeech("rest");
            long delay = deadline - System.currentTimeMillis();
            if (delay <= 0 || delay > 600_000) return;
            if (delay >= 4800) {
                restWarning = () -> playWarning(voice, "rest");
                handler.postDelayed(restWarning, Math.max(0, delay - 5000));
            }
            handler.postDelayed(restComplete, delay);
        });
        call.resolve();
    }

    private void playWarning(String voice, String cue) {
        if (!speak("Five seconds left.", voice, cue)) {
            play(ToneGenerator.TONE_PROP_BEEP, 180);
        }
    }

    private boolean speak(String message, String voiceId, String cue) {
        List<Voice> voices = offlineEnglishVoices();
        if (voices.isEmpty()) return false;
        Voice selected = null;
        for (Voice voice : voices) {
            if (voice.getName().equals(voiceId)) {
                selected = voice;
                break;
            }
        }
        if (selected == null) {
            Voice defaultVoice = speech.getDefaultVoice();
            selected = voices.contains(defaultVoice) ? defaultVoice : voices.get(0);
        }
        if (speech.setVoice(selected) != TextToSpeech.SUCCESS) return false;
        if (speech.speak(message, TextToSpeech.QUEUE_FLUSH, null, cue) != TextToSpeech.SUCCESS) return false;
        speakingCue = cue;
        return true;
    }

    private void stopSpeech(String cue) {
        if (speechReady && cue.equals(speakingCue)) {
            speech.stop();
            speakingCue = null;
        }
    }

    private void play(int tone, int durationMs) {
        try {
            if (tones == null) tones = new ToneGenerator(AudioManager.STREAM_MUSIC, 85);
            tones.startTone(tone, durationMs);
        } catch (RuntimeException ignored) {
            // The visible timer keeps running if the device has no audio output.
        }
    }

    @Override protected void handleOnDestroy() {
        handler.removeCallbacksAndMessages(null);
        if (tones != null) tones.release();
        if (speech != null) speech.shutdown();
        tones = null;
        speech = null;
        speechReady = false;
        super.handleOnDestroy();
    }
}
