package com.ezpz.fitness;

import android.Manifest;
import android.app.Activity;
import android.content.ClipData;
import android.content.Intent;
import android.graphics.Matrix;
import android.media.ExifInterface;
import android.net.Uri;
import android.provider.MediaStore;
import androidx.activity.result.ActivityResult;
import androidx.core.content.FileProvider;
import com.getcapacitor.PermissionState;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.io.File;
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

/** Bundled on-device Latin OCR with explicit camera capture and temporary private photo cleanup. */
@CapacitorPlugin(name = "EzpzLabelReader", permissions = {@Permission(alias = "camera", strings = {Manifest.permission.CAMERA})})
public class LabelReaderPlugin extends Plugin {
    private final AtomicBoolean busy = new AtomicBoolean(false);
    @PluginMethod public void capture(PluginCall call) {
        if (busy.get()) { call.reject("A label is already being read."); return; }
        if (getPermissionState("camera") != PermissionState.GRANTED) {
            requestPermissionForAlias("camera", call, "cameraPermission");
        } else openCamera(call);
    }
    @PermissionCallback private void cameraPermission(PluginCall call) {
        if (getPermissionState("camera") == PermissionState.GRANTED) openCamera(call);
        else call.reject("Allow camera access to photograph a nutrition label.", "CAMERA_DENIED");
    }
    private void openCamera(PluginCall call) {
        if (!busy.compareAndSet(false, true)) { call.reject("A label is already being read."); return; }
        File photo = null;
        try {
            Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
            if (intent.resolveActivity(getContext().getPackageManager()) == null) throw new IllegalStateException();
            photo = File.createTempFile("ezpz-label-", ".jpg", getContext().getCacheDir());
            call.getData().put("captureName", photo.getName());
            intent = cameraIntent(getContext(), photo);
            startActivityForResult(call, intent, "labelCaptured");
        } catch (Exception error) {
            if (photo != null) photo.delete(); busy.set(false);
            call.reject("Could not open the camera. You can choose an existing photo instead.");
        }
    }
    static Intent cameraIntent(android.content.Context context, File photo) {
        Uri uri = FileProvider.getUriForFile(context, context.getPackageName() + ".fileprovider", photo);
        Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        intent.putExtra(MediaStore.EXTRA_OUTPUT, uri);
        intent.setClipData(ClipData.newRawUri("Nutrition label", uri));
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
        return intent;
    }
    @ActivityCallback private void labelCaptured(PluginCall call, ActivityResult result) {
        if (call == null) { busy.set(false); return; }
        String name = call.getString("captureName", "");
        if (!name.matches("ezpz-label-[A-Za-z0-9-]+\\.jpg")) { busy.set(false); call.reject("Please take the label photo again."); return; }
        File photo = new File(getContext().getCacheDir(), name);
        if (result.getResultCode() != Activity.RESULT_OK) {
            photo.delete(); busy.set(false); call.reject("Photo cancelled.", "CAMERA_CANCELLED"); return;
        }
        new Thread(() -> {
            try {
                Bitmap bitmap = decodeCameraPhoto(photo);
                readBitmap(call, bitmap, photo);
            } catch (Exception error) {
                photo.delete(); busy.set(false); call.reject("Could not read the camera photo. Try a clear close-up of the label.");
            }
        }, "ezpz-label-camera").start();
    }
    static Bitmap decodeCameraPhoto(File photo) throws Exception {
        BitmapFactory.Options opts = new BitmapFactory.Options(); opts.inJustDecodeBounds = true;
        BitmapFactory.decodeFile(photo.getPath(), opts);
        if (opts.outWidth <= 0 || opts.outHeight <= 0) throw new IllegalArgumentException();
        opts.inSampleSize = 1;
        while (Math.max(opts.outWidth, opts.outHeight) / opts.inSampleSize > 2200) opts.inSampleSize *= 2;
        opts.inJustDecodeBounds = false;
        Bitmap original = BitmapFactory.decodeFile(photo.getPath(), opts);
        if (original == null) throw new IllegalArgumentException();
        int orientation = new ExifInterface(photo.getPath()).getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL);
        Matrix transform = new Matrix();
        switch (orientation) {
            case ExifInterface.ORIENTATION_FLIP_HORIZONTAL: transform.setScale(-1, 1); break;
            case ExifInterface.ORIENTATION_ROTATE_180: transform.setRotate(180); break;
            case ExifInterface.ORIENTATION_FLIP_VERTICAL: transform.setScale(1, -1); break;
            case ExifInterface.ORIENTATION_TRANSPOSE: transform.setRotate(90); transform.postScale(-1, 1); break;
            case ExifInterface.ORIENTATION_ROTATE_90: transform.setRotate(90); break;
            case ExifInterface.ORIENTATION_TRANSVERSE: transform.setRotate(270); transform.postScale(-1, 1); break;
            case ExifInterface.ORIENTATION_ROTATE_270: transform.setRotate(270); break;
        }
        if (transform.isIdentity()) return original;
        Bitmap rotated = Bitmap.createBitmap(original, 0, 0, original.getWidth(), original.getHeight(), transform, true);
        if (rotated != original) original.recycle();
        return rotated;
    }
    private void readBitmap(PluginCall call, Bitmap image, File temporary) {
        final TextRecognizer reader = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS);
        reader.process(InputImage.fromBitmap(image, 0))
            .addOnSuccessListener(text -> {
                JSObject result = new JSObject(); String ordered = orderedText(text);
                result.put("text", ordered.length() > 20000 ? ordered.substring(0, 20000) : ordered);
                call.resolve(result);
            })
            .addOnFailureListener(error -> call.reject("Could not read the label. Try a clearer photo or enter the values."))
            .addOnCompleteListener(task -> { image.recycle(); reader.close(); if (temporary != null) temporary.delete(); busy.set(false); });
    }
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
                readBitmap(call, bitmap, null);
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
