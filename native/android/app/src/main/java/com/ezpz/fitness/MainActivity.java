package com.ezpz.fitness;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
public class MainActivity extends BridgeActivity {
    @Override public void onCreate(Bundle savedInstanceState) {
        registerPlugin(HealthConnectPlugin.class);
        registerPlugin(BackupPlugin.class);
        registerPlugin(AccountPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
