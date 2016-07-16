package kr.iamport.ionic_inicis;

import org.apache.cordova.CordovaPlugin;

public class IamportInicisPlugin extends CordovaPlugin {

    private InicisUrlSchemeHandler urlSchemeHandler;

    protected void pluginInitialize() {
        this.urlSchemeHandler = new InicisUrlSchemeHandler(cordova);
    }

    public boolean onOverrideUrlLoading(String url) {
        return this.urlSchemeHandler.handleUrl(url);
    }

}