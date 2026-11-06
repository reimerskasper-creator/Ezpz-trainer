package com.ezpz.fitness;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.text.Text;
import com.google.mlkit.vision.text.TextRecognition;
import com.google.mlkit.vision.text.TextRecognizer;
import com.google.mlkit.vision.text.latin.TextRecognizerOptions;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

/** Bundled, on-device Latin OCR. Receives one user-selected image; no network or file access. */
@CapacitorPlugin(name = "EzpzLabelReader")
public class LabelReaderPlugin extends Plugin {
    private final AtomicBoolean busy = new AtomicBoolean(false);
    @PluginMethod public void recognize(PluginCall call) {
        String encoded = call.getString("image");
        if (encoded == null || encoded.length() > 3000000) { call.reject("Choose a smaller label photo."); return; }
        if (!busy.compareAndSet(false, true)) { call.reject("A label is already being read."); return; }
        new Thread(() -> {
            Bitmap bitmap = null;
            try {
                byte[] bytes = Base64.decode(encoded, Base64.DEFAULT);
                BitmapFactory.Options bounds = new BitmapFactory.Options(); bounds.inJustDecodeBounds = true;
                BitmapFactory.decodeByteArray(bytes, 0, bytes.length, bounds);
                if (bounds.outWidth <= 0 || bounds.outHeight <= 0 || bounds.outWidth > 2400 || bounds.outHeight > 2400) throw new IllegalArgumentException();
                bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
                if (bitmap == null) throw new IllegalArgumentException();
                final Bitmap image = bitmap;
                final TextRecognizer reader = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS);
                reader.process(InputImage.fromBitmap(image, 0))
                    .addOnSuccessListener(text -> {
                        JSObject result = new JSObject();
                        String ordered = orderedText(text);
                        result.put("text", ordered.length() > 20000 ? ordered.substring(0, 20000) : ordered);
                        call.resolve(result);
                    })
                    .addOnFailureListener(error -> call.reject("Could not read the label. Try a clearer photo or enter the values."))
                    .addOnCompleteListener(task -> { image.recycle(); reader.close(); busy.set(false); });
            } catch (Exception error) {
                if (bitmap != null) bitmap.recycle();
                busy.set(false); call.reject("Could not open this label photo. Try another image.");
            }
        }, "ezpz-label-reader").start();
    }
    static String orderedText(Text text) {
        List<Text.Line> lines = new ArrayList<>();
        for (Text.TextBlock block : text.getTextBlocks()) for (Text.Line line : block.getLines()) if (line.getBoundingBox() != null) lines.add(line);
        lines.sort(Comparator.comparingInt((Text.Line line) -> line.getBoundingBox().centerY()));
        List<List<Text.Line>> rows = new ArrayList<>();
        for (Text.Line line : lines) {
            if (!rows.isEmpty()) {
                Text.Line first = rows.get(rows.size() - 1).get(0);
                if (Math.abs(first.getBoundingBox().centerY() - line.getBoundingBox().centerY()) < Math.min(first.getBoundingBox().height(), line.getBoundingBox().height()) * 0.55) {
                    rows.get(rows.size() - 1).add(line); continue;
                }
            }
            List<Text.Line> row = new ArrayList<>(); row.add(line); rows.add(row);
        }
        StringBuilder result = new StringBuilder();
        for (List<Text.Line> row : rows) {
            row.sort(Comparator.comparingInt((Text.Line line) -> line.getBoundingBox().left));
            for (Text.Line line : row) result.append(line.getText()).append(' ');
            result.append('\n');
        }
        return result.toString();
    }
}
