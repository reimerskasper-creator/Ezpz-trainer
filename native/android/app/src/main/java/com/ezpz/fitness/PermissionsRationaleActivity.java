package com.ezpz.fitness;
import android.app.Activity;
import android.os.Bundle;
import android.widget.TextView;
public class PermissionsRationaleActivity extends Activity {
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        TextView text = new TextView(this);
        text.setPadding(48, 64, 48, 48); text.setTextSize(18);
        text.setText("EZPZ Fitness — Health Connect\n\nWith your permission, Sync now reads the last seven days of WHOOP steps, sleep duration and optional sleep stages, active calories and total calories. Unavailable data stays blank.\n\nImported records are saved on this device. Manual entries stay saved. We never add calories from different apps or change food targets. There is no background sync and no health data is uploaded by this test build.\n\nYou can revoke access in Health Connect at any time. Previously imported records remain until you delete device records in EZPZ. Android and the browser app have separate storage.\n\nThis is an Android test build. Google sign-in is available in the browser app only.\n\nPrivacy and support: reimerskasper@gmail.com\nhttps://reimerskasper-creator.github.io/Ezpz-trainer/fitness-privacy.html");
        setContentView(text);
    }
}
