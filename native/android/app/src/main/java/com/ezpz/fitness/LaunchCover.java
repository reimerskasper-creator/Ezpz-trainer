package com.ezpz.fitness;

import android.animation.ValueAnimator;
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffXfermode;
import android.graphics.Shader;
import android.graphics.drawable.Drawable;
import android.view.View;
import android.view.animation.LinearInterpolator;

final class LaunchCover extends View {
    private final Drawable logo;
    private final int iconSize;
    private final Paint highlight = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Matrix position = new Matrix();
    private ValueAnimator sweep;
    private float sweepProgress;

    LaunchCover(Context context) {
        super(context);
        setBackgroundColor(context.getColor(R.color.launch_background));
        setClickable(true);
        setImportantForAccessibility(IMPORTANT_FOR_ACCESSIBILITY_NO);
        logo = context.getDrawable(R.drawable.launch_wordmark);
        iconSize = logo.getIntrinsicWidth();
        float width = iconSize * 0.19f;
        highlight.setShader(new LinearGradient(-width, 0, width, width * 0.55f,
                new int[]{Color.TRANSPARENT, 0x885DFFC5, Color.TRANSPARENT},
                null, Shader.TileMode.CLAMP));
        highlight.setXfermode(new PorterDuffXfermode(PorterDuff.Mode.SRC_ATOP));
    }

    void startSweep() {
        if (!ValueAnimator.areAnimatorsEnabled()) return;
        sweep = ValueAnimator.ofFloat(0f, 1f);
        sweep.setDuration(520);
        sweep.setInterpolator(new LinearInterpolator());
        sweep.addUpdateListener(animation -> {
            sweepProgress = (float) animation.getAnimatedValue();
            invalidate();
        });
        sweep.start();
    }

    @Override protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        int left = (getWidth() - iconSize) / 2;
        int top = (getHeight() - iconSize) / 2;
        logo.setBounds(left, top, left + iconSize, top + iconSize);
        if (sweepProgress <= 0f || sweepProgress >= 1f) {
            logo.draw(canvas);
            return;
        }
        int layer = canvas.saveLayer(left, top, left + iconSize, top + iconSize, null);
        logo.draw(canvas);
        position.setTranslate(left + iconSize * sweepProgress, top + iconSize * 0.40f);
        highlight.getShader().setLocalMatrix(position);
        canvas.drawRect(left, top, left + iconSize, top + iconSize, highlight);
        canvas.restoreToCount(layer);
    }

    @Override protected void onDetachedFromWindow() {
        if (sweep != null) sweep.cancel();
        super.onDetachedFromWindow();
    }
}
