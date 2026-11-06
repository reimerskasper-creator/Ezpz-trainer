package com.ezpz.fitness;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Typeface;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import com.google.android.gms.tasks.Tasks;
import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.text.TextRecognition;
import com.google.mlkit.vision.text.TextRecognizer;
import com.google.mlkit.vision.text.latin.TextRecognizerOptions;
import java.util.concurrent.TimeUnit;
import org.junit.Test;
import org.junit.runner.RunWith;
import static org.junit.Assert.assertTrue;

/** Real bundled OCR on generated fixtures, not a mocked native bridge or package photos. */
@RunWith(AndroidJUnit4.class)
public class LabelReaderOcrTest {
    @Test public void cameraUsesFullResolutionOutputAndDecodesRotatedPhoto() throws Exception {
        android.content.Context context = androidx.test.platform.app.InstrumentationRegistry.getInstrumentation().getTargetContext();
        java.io.File photo = java.io.File.createTempFile("ezpz-label-", ".jpg", context.getCacheDir());
        Bitmap source = Bitmap.createBitmap(4000, 2000, Bitmap.Config.ARGB_8888);
        try {
            android.content.Intent intent = LabelReaderPlugin.cameraIntent(context, photo);
            org.junit.Assert.assertEquals(android.provider.MediaStore.ACTION_IMAGE_CAPTURE, intent.getAction());
            android.net.Uri output = intent.getParcelableExtra(android.provider.MediaStore.EXTRA_OUTPUT);
            org.junit.Assert.assertEquals("content", output.getScheme());
            org.junit.Assert.assertEquals(context.getPackageName() + ".fileprovider", output.getAuthority());
            assertTrue((intent.getFlags() & android.content.Intent.FLAG_GRANT_WRITE_URI_PERMISSION) != 0);
            try (java.io.OutputStream stream = context.getContentResolver().openOutputStream(output)) {
                assertTrue(source.compress(Bitmap.CompressFormat.JPEG, 90, stream));
            }
            android.media.ExifInterface exif = new android.media.ExifInterface(photo.getPath());
            exif.setAttribute(android.media.ExifInterface.TAG_ORIENTATION, "6"); exif.saveAttributes();
            Bitmap decoded = LabelReaderPlugin.decodeCameraPhoto(photo);
            try { org.junit.Assert.assertEquals(1000, decoded.getWidth()); org.junit.Assert.assertEquals(2000, decoded.getHeight()); }
            finally { decoded.recycle(); }
        } finally { source.recycle(); photo.delete(); }
    }
    @Test public void readsThreeSingleColumnLabelsWithoutModelDownload() throws Exception {
        String[][] fixtures = {
            {"56", "70", "2", "1", "12"},
            {"33", "180", "15", "8", "6"},
            {"57", "230", "20", "2", "10"}
        };
        for (String[] f : fixtures) {
            Bitmap image = Bitmap.createBitmap(1100, 1000, Bitmap.Config.ARGB_8888);
            Canvas canvas = new Canvas(image); canvas.drawColor(Color.WHITE);
            Paint ink = new Paint(Paint.ANTI_ALIAS_FLAG); ink.setColor(Color.BLACK);
            ink.setTypeface(Typeface.create("sans-serif", Typeface.BOLD)); ink.setTextSize(48);
            String[] lines = {"Nutrition Facts", "Serving Size (" + f[0] + "g)", "Calories " + f[1],
                "Total Fat " + f[2] + "g", "Saturated Fat 0g", "Total Carbohydrate " + f[3] + "g", "Protein " + f[4] + "g"};
            for (int n = 0; n < lines.length; n++) canvas.drawText(lines[n], 60, 90 + n * 115, ink);
            TextRecognizer reader = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS);
            try {
                String text = LabelReaderPlugin.orderedText(Tasks.await(reader.process(InputImage.fromBitmap(image, 0)), 45, TimeUnit.SECONDS));
                // Saturated fat is not an imported field. Unknown OCR characters must not be guessed as digits.
                for (int n : new int[]{1, 2, 3, 5, 6}) { String line = lines[n]; assertTrue("Missing " + line + " in OCR:\n" + text,
                    text.toLowerCase().replaceAll("\\s", "").contains(line.toLowerCase().replaceAll("\\s", ""))); }
            } finally { reader.close(); image.recycle(); }
        }
    }
}
