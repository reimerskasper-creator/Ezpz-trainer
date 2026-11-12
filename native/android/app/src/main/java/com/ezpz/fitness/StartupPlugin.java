package com.ezpz.fitness;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "EzpzStartup")
public class StartupPlugin extends Plugin {
    @PluginMethod public void ready(PluginCall call) {
        MainActivity activity = (MainActivity) getActivity();
        activity.runOnUiThread(activity::onStartupReady);
        call.resolve();
    }
}
