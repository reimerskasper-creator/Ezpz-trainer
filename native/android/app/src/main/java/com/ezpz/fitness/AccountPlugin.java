package com.ezpz.fitness;
import android.content.Intent;
import android.net.Uri;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "EzpzAccount")
public class AccountPlugin extends Plugin {
    private String pendingUrl;
    private boolean validCallback(Uri uri) {
        return uri != null && "ezpzfitness".equals(uri.getScheme())
            && ("auth".equals(uri.getHost()) || "whoop".equals(uri.getHost()))
            && "/callback".equals(uri.getPath()) && uri.toString().length() <= 8192;
    }
    @Override public void load() {
        Uri uri = getActivity().getIntent().getData();
        if (validCallback(uri)) pendingUrl = uri.toString();
    }
    @Override protected void handleOnNewIntent(Intent intent) {
        Uri uri = intent.getData();
        if (!validCallback(uri)) return;
        if (hasListeners("authCallback")) {
            JSObject result = new JSObject();
            result.put("url", uri.toString());
            notifyListeners("authCallback", result);
        } else pendingUrl = uri.toString();
    }
    @PluginMethod public void getPendingUrl(PluginCall call) {
        JSObject result = new JSObject();
        if (pendingUrl != null) result.put("url", pendingUrl);
        pendingUrl = null;
        call.resolve(result);
    }
    @PluginMethod public void openAuth(PluginCall call) {
        String value = call.getString("url");
        if (value == null || value.length() > 8192) { call.reject("Invalid authorization URL."); return; }
        Uri uri = Uri.parse(value);
        boolean allowed = "https".equals(uri.getScheme()) && uri.getUserInfo() == null
            && (uri.getPort() == -1 || uri.getPort() == 443)
            && (("uwfetvlddswsmqcitgzy.supabase.co".equals(uri.getHost()) && "/auth/v1/authorize".equals(uri.getPath()))
                || ("api.prod.whoop.com".equals(uri.getHost()) && "/oauth/oauth2/auth".equals(uri.getPath())));
        if (!allowed) { call.reject("Authorization host is not allowed."); return; }
        try { getActivity().startActivity(new Intent(Intent.ACTION_VIEW, uri)); call.resolve(); }
        catch (Exception error) { call.reject("Could not open your browser."); }
    }
}
