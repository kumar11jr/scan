package com.kumar11jr.nativebridge

import android.app.Activity
import android.content.Intent
import com.facebook.react.bridge.*
import com.journeyapps.barcodescanner.ScanContract
import com.journeyapps.barcodescanner.ScanOptions

class QRCodeScannerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private var scannerPromise: Promise? = null

    override fun getName() = "QRCodeScannerModule"

    init {
        reactContext.addActivityEventListener(this)
    }

    @ReactMethod
    fun scanQRCode(promise: Promise) {
        if (scannerPromise != null) {
            promise.reject("E_SCAN_IN_PROGRESS", "A scan is already in progress.")
            return
        }

        scannerPromise = promise

        val currentActivity = currentActivity
        if (currentActivity == null) {
            promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist")
            return
        }

        val options = ScanOptions()
        options.setPrompt("Scan a QR Code")
        options.setBeepEnabled(true)
        options.setOrientationLocked(true)
        val intent = ScanContract().createIntent(reactApplicationContext, options)

        currentActivity.startActivityForResult(intent, SCANNER_REQUEST_CODE)
    }

    override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == SCANNER_REQUEST_CODE) {
            if (resultCode == Activity.RESULT_OK) {
                val result = data?.getStringExtra("SCAN_RESULT")
                if (result != null) {
                    scannerPromise?.resolve(result)
                } else {
                    scannerPromise?.reject("E_NO_RESULT", "No result was returned from scanner")
                }
            } else {
                scannerPromise?.reject("E_SCAN_CANCELLED", "Scan was cancelled")
            }
            scannerPromise = null
        }
    }

    override fun onNewIntent(intent: Intent?) {}

    companion object {
        private const val SCANNER_REQUEST_CODE = 1234
    }
}
