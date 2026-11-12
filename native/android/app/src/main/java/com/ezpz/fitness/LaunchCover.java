package com.ezpz.fitness;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.animation.ValueAnimator;
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.LinearGradient;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffXfermode;
import android.graphics.Rect;
import android.graphics.Shader;
import android.graphics.drawable.Drawable;
import android.view.View;
import android.view.animation.AccelerateDecelerateInterpolator;

final class LaunchCover extends View {
    private final Drawable logo;
    private final Paint light = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint highlight = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Matrix position = new Matrix();
    private ValueAnimator sweep;
    private float progress;
    private float band;
    private LinearGradient frameGradient;
    private LinearGradient logoGradient;

    LaunchCover(Context context) {
        super(context);
        setBackgroundColor(context.getColor(R.color.launch_background));
        setClickable(true);
        setImportantForAccessibility(IMPORTANT_FOR_ACCESSIBILITY_NO);
        logo = context.getDrawable(R.drawable.launch_wordmark);
        highlight.setXfermode(new PorterDuffXfermode(PorterDuff.Mode.SRC_ATOP));
    }

    void startSweep(Runnable onFinished) {
        if (!ValueAnimator.areAnimatorsEnabled()) return;
        sweep = ValueAnimator.ofFloat(0f, 1f);
        sweep.setDuration(780);
        sweep.setInterpolator(new AccelerateDecelerateInterpolator());
        sweep.addUpdateListener(animation -> {
            progress = (float) animation.getAnimatedValue();
            invalidate();
        });
        sweep.addListener(new AnimatorListenerAdapter() {
            @Override public void onAnimationEnd(Animator animation) {
                sweep = null;
                onFinished.run();
            }
        });
        sweep.start();
    }

    boolean isSweeping() {
        return sweep != null && sweep.isRunning();
    }

    @Override protected void onSizeChanged(int width, int height, int oldWidth, int oldHeight) {
        super.onSizeChanged(width, height, oldWidth, oldHeight);
        if (width == 0 || height == 0) return;
        int size = Math.round(Math.min(width, height) * 1.28f);
        int left = (width - size) / 2;
        int top = (height - size) / 2;
        logo.setBounds(left, top, left + size, top + size);

        float diagonal = (float) Math.hypot(width, height);
        band = Math.min(width, height) * 0.34f;
        float x = band * width / diagonal;
        float y = -band * height / diagonal;
        float[] stops = {0f, 0.52f, 0.72f, 0.76f, 1f};
        frameGradient = new LinearGradient(-x, -y, x, y,
                new int[]{0x000B553E, 0x1616A779, 0x4349E8AE, 0x665FFFC4, 0x000B553E},
                stops, Shader.TileMode.CLAMP);
        logoGradient = new LinearGradient(-x, -y, x, y,
                new int[]{0x000B553E, 0x3021CA91, 0x8865FFD1, 0xB6B7FFE7, 0x000B553E},
                stops, Shader.TileMode.CLAMP);
        light.setShader(frameGradient);
        highlight.setShader(logoGradient);
    }

    @Override protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        if (frameGradient == null || progress <= 0f || progress >= 1f) {
            logo.draw(canvas);
            return;
        }
        int width = getWidth();
        int height = getHeight();
        float travel = band / (float) Math.hypot(width, height);
        float fraction = -travel + (1f + 2f * travel) * progress;
        position.setTranslate(width * fraction, height * (1f - fraction));
        frameGradient.setLocalMatrix(position);
        logoGradient.setLocalMatrix(position);
        canvas.drawRect(0, 0, width, height, light);

        Rect bounds = logo.getBounds();
        int layer = canvas.saveLayer(0, Math.max(0, bounds.top), width, Math.min(height, bounds.bottom), null);
        logo.draw(canvas);
        canvas.drawRect(bounds, highlight);
        canvas.restoreToCount(layer);
    }

    @Override protected void onDetachedFromWindow() {
        if (sweep != null) {
            sweep.removeAllListeners();
            sweep.cancel();
        }
        super.onDetachedFromWindow();
    }
}
