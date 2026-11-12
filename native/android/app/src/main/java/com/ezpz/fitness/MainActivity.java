package com.ezpz.fitness;

import android.animation.ValueAnimator;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import androidx.activity.EdgeToEdge;
import androidx.activity.SystemBarStyle;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private LaunchCover launchCover;
    private WebView startupWebView;
    private final Runnable startupTimeout = this::revealApp;
    private boolean revealingApp;
    private boolean splashExited;
    private boolean appReady;
    private int previousAccessibility;

    @Override public void onCreate(Bundle savedInstanceState) {
        SplashScreen splash = SplashScreen.installSplashScreen(this);
        registerPlugin(HealthConnectPlugin.class);
        registerPlugin(BackupPlugin.class);
        registerPlugin(LabelReaderPlugin.class);
        registerPlugin(AccountPlugin.class);
        registerPlugin(StartupPlugin.class);
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this, SystemBarStyle.dark(Color.rgb(8, 45, 34)),
                SystemBarStyle.dark(Color.rgb(8, 45, 34)));
        if (getBridge() == null) return;

        startupWebView = getBridge().getWebView();
        startupWebView.setBackgroundColor(getColor(R.color.launch_background));
        previousAccessibility = startupWebView.getImportantForAccessibility();
        startupWebView.setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS);
        launchCover = new LaunchCover(this);
        addContentView(launchCover, new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        splash.setOnExitAnimationListener(provider -> {
            provider.remove();
            splashExited = true;
            if (savedInstanceState == null && !revealingApp && launchCover != null) {
                launchCover.startSweep(this::revealAfterSweep);
            }
            revealAfterSweep();
        });
        // A broken WebView or a missing asset must not leave the launch screen up forever.
        launchCover.postDelayed(startupTimeout, 5000);
    }

    void onStartupReady() {
        if (launchCover == null || revealingApp) return;
        startupWebView.postVisualStateCallback(0, new WebView.VisualStateCallback() {
            @Override public void onComplete(long requestId) {
                appReady = true;
                revealAfterSweep();
            }
        });
    }

    private void revealAfterSweep() {
        if (splashExited && appReady && launchCover != null && !launchCover.isSweeping()) {
            revealApp();
        }
    }

    private void revealApp() {
        if (launchCover == null || revealingApp) return;
        revealingApp = true;
        launchCover.removeCallbacks(startupTimeout);
        if (!ValueAnimator.areAnimatorsEnabled()) {
            removeLaunchCover();
            return;
        }
        launchCover.animate().alpha(0f).setDuration(150).withEndAction(this::removeLaunchCover);
    }

    private void removeLaunchCover() {
        if (launchCover == null) return;
        launchCover.removeCallbacks(startupTimeout);
        launchCover.animate().cancel();
        ((ViewGroup) launchCover.getParent()).removeView(launchCover);
        launchCover = null;
        startupWebView.setImportantForAccessibility(previousAccessibility);
    }

    @Override public void onDestroy() {
        removeLaunchCover();
        super.onDestroy();
    }
}
