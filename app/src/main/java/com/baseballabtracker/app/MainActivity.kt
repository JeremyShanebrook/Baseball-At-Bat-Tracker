package com.baseballabtracker.app

import android.annotation.SuppressLint
import android.app.AlertDialog
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.activity.ComponentActivity
import androidx.core.content.FileProvider
import androidx.core.view.WindowCompat
import org.json.JSONObject
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

class MainActivity : ComponentActivity() {
    private lateinit var webView: WebView

    private fun currentChannel(): String = getPreferences(MODE_PRIVATE).getString("channel", "official") ?: "official"
    private fun currentVersionName(): String = packageManager.getPackageInfo(packageName, 0).versionName ?: "1.0"
    private fun currentVersionCode(): Int = packageManager.getPackageInfo(packageName, 0).longVersionCode.toInt()

    companion object {
        // CHANGE THESE TWO VALUES to your GitHub account/repository.
        private const val GITHUB_OWNER = "JeremyShanebrook"
        private const val GITHUB_REPO = "Baseball-At-Bat-Tracker"
        private const val DEV_PIN = "1990"
        private const val OFFICIAL_BRANCH = "main"
        private const val TESTING_BRANCH = "develop"
    }

    private var developerUnlocked = false
    private var updateCheckDone = false

    @SuppressLint("SetJavaScriptEnabled", "JavascriptInterface")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, true)
        window.statusBarColor = Color.rgb(11, 31, 51)
        window.navigationBarColor = Color.rgb(11, 31, 51)

        webView = WebView(this).apply {
            setBackgroundColor(Color.rgb(11, 31, 51))
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.databaseEnabled = true
            settings.allowFileAccess = true
            settings.allowContentAccess = true
            settings.mediaPlaybackRequiresUserGesture = false
            settings.builtInZoomControls = false
            settings.displayZoomControls = false
            settings.textZoom = 100
            addJavascriptInterface(AndroidBridge(), "AndroidApp")
            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                    return request.url.scheme != "file" && request.url.scheme != "about"
                }
                override fun onPageFinished(view: WebView, url: String) {
                    super.onPageFinished(view, url)
                    if (!updateCheckDone) {
                        updateCheckDone = true
                        postDelayed({ checkForUpdatesInternal(currentChannel(), silent = true) }, 1200)
                    }
                }
            }
            webChromeClient = WebChromeClient()
            loadUrl("file:///android_asset/index.html")
        }

        setContentView(webView)

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) webView.goBack() else finish()
            }
        })
    }

    private inner class AndroidBridge {
        @JavascriptInterface fun versionName(): String = packageManager.getPackageInfo(packageName, 0).versionName ?: "1.0"
        @JavascriptInterface fun versionCode(): Int = packageManager.getPackageInfo(packageName, 0).longVersionCode.toInt()
        @JavascriptInterface fun developerIsUnlocked(): Boolean = developerUnlocked
        @JavascriptInterface fun unlockDeveloper(pin: String): Boolean {
            developerUnlocked = pin == DEV_PIN
            return developerUnlocked
        }
        @JavascriptInterface fun currentChannel(): String = getPreferences(MODE_PRIVATE).getString("channel", "official") ?: "official"
        @JavascriptInterface fun setChannel(channel: String): Boolean {
            if (!developerUnlocked) return false
            val c = if (channel == "testing") "testing" else "official"
            getPreferences(MODE_PRIVATE).edit().putString("channel", c).apply()
            return true
        }
        @JavascriptInterface fun checkForUpdates() {
            val channel = currentChannel()
            checkForUpdatesInternal(channel)
        }
        @JavascriptInterface fun checkTestingUpdate() {
            if (developerUnlocked) checkForUpdatesInternal("testing")
        }
        @JavascriptInterface fun openBugReport() {
            val url = "https://github.com/$GITHUB_OWNER/$GITHUB_REPO/issues/new?title=Bug%20Report&labels=bug"
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
        }
        @JavascriptInterface fun openFeatureRequest() {
            val url = "https://github.com/$GITHUB_OWNER/$GITHUB_REPO/issues/new?title=Feature%20Request&labels=enhancement"
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
        }
        @JavascriptInterface fun debugInfo(): String {
            return "version=${versionName()}\\nversionCode=${versionCode()}\\nchannel=${currentChannel()}\\nandroid=${android.os.Build.VERSION.RELEASE}\\ndevice=${android.os.Build.MANUFACTURER} ${android.os.Build.MODEL}"
        }
        @JavascriptInterface fun showRollback() {
            if (!developerUnlocked) return
            thread {
                try {
                    val conn = URL(manifestUrl("testing")).openConnection() as HttpURLConnection
                    conn.connectTimeout = 8000; conn.readTimeout = 8000
                    val body = conn.inputStream.bufferedReader().use { it.readText() }
                    conn.disconnect()
                    val arr = JSONObject(body).optJSONArray("previous") ?: org.json.JSONArray()
                    val labels = ArrayList<String>(); val urls = ArrayList<String>()
                    for (i in 0 until arr.length()) { val o=arr.getJSONObject(i); labels.add(o.optString("versionName","previous")); urls.add(o.optString("apkUrl","")) }
                    runOnUiThread {
                        if (labels.isEmpty()) { showMessage("No rollback builds are listed in the testing update manifest."); return@runOnUiThread }
                        AlertDialog.Builder(this@MainActivity).setTitle("Rollback version")
                            .setItems(labels.toTypedArray()) { _, which -> if (urls[which].isNotBlank()) downloadAndInstall(urls[which], labels[which]) }
                            .setNegativeButton("Cancel", null).show()
                    }
                } catch (_: Exception) { runOnUiThread { showMessage("Couldn't load rollback versions.") } }
            }
        }
        @JavascriptInterface fun clearUpdateCache() { File(cacheDir, "updates").deleteRecursively() }
        @JavascriptInterface fun openInstallSettings() {
            startActivity(Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:$packageName")))
        }
    }

    private fun manifestUrl(channel: String): String {
        val branch = if (channel == "testing") TESTING_BRANCH else OFFICIAL_BRANCH
        return "https://raw.githubusercontent.com/$GITHUB_OWNER/$GITHUB_REPO/$branch/update-manifest.json"
    }

    private fun checkForUpdatesInternal(channel: String, silent: Boolean = false) {
        if (GITHUB_OWNER.isBlank() || GITHUB_REPO.isBlank()) {
            runOnUiThread { if (!silent) showMessage("Update system isn't configured yet. Open MainActivity.kt and set GITHUB_OWNER and GITHUB_REPO to your GitHub repository.") }
            return
        }
        thread {
            try {
                val conn = URL(manifestUrl(channel)).openConnection() as HttpURLConnection
                conn.connectTimeout = 8000
                conn.readTimeout = 8000
                conn.requestMethod = "GET"
                val body = conn.inputStream.bufferedReader().use { it.readText() }
                conn.disconnect()
                val m = JSONObject(body)
                val remoteCode = m.optInt("versionCode", 0)
                val remoteName = m.optString("versionName", "new version")
                val notes = m.optString("releaseNotes", "")
                val apkUrl = m.optString("apkUrl", "")
                val current = currentVersionCode()
                runOnUiThread {
                    if (remoteCode > current && apkUrl.isNotBlank()) {
                        AlertDialog.Builder(this)
                            .setTitle("Update available")
                            .setMessage("Version $remoteName is available.\n\n$notes")
                            .setNegativeButton("Later", null)
                            .setPositiveButton("Download & Install") { _, _ -> downloadAndInstall(apkUrl, remoteName) }
                            .show()
                    } else if (!silent) {
                        showMessage("You're up to date.\nVersion ${currentVersionName()} · ${if (channel == "testing") "Testing" else "Official"}")
                    }
                }
            } catch (e: Exception) {
                if (!silent) runOnUiThread { showMessage("Couldn't check for updates. Check your internet connection and GitHub repository settings.") }
            }
        }
    }

    private fun downloadAndInstall(apkUrl: String, version: String) {
        thread {
            try {
                val dir = File(cacheDir, "updates").apply { mkdirs() }
                val apk = File(dir, "Baseball-At-Bat-Tracker-$version.apk")
                val conn = URL(apkUrl).openConnection() as HttpURLConnection
                conn.connectTimeout = 15000
                conn.readTimeout = 30000
                conn.inputStream.use { input -> apk.outputStream().use { output -> input.copyTo(output) } }
                conn.disconnect()
                val uri = FileProvider.getUriForFile(this, "$packageName.fileprovider", apk)
                runOnUiThread {
                    val intent = Intent(Intent.ACTION_VIEW).apply {
                        setDataAndType(uri, "application/vnd.android.package-archive")
                        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    try { startActivity(intent) } catch (_: Exception) {
                        showMessage("Android blocked the installer. Allow this app to install unknown apps, then try again.")
                    }
                }
            } catch (_: Exception) {
                runOnUiThread { showMessage("The update download failed.") }
            }
        }
    }

    private fun showMessage(message: String) {
        AlertDialog.Builder(this).setMessage(message).setPositiveButton("OK", null).show()
    }

    override fun onDestroy() {
        webView.stopLoading()
        webView.destroy()
        super.onDestroy()
    }
}
