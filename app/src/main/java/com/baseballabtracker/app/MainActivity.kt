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
                    val conn = URL(releasesUrl()).openConnection() as HttpURLConnection
                    conn.connectTimeout = 10000; conn.readTimeout = 10000
                    conn.requestMethod = "GET"
                    conn.setRequestProperty("Accept", "application/vnd.github+json")
                    conn.setRequestProperty("X-GitHub-Api-Version", "2022-11-28")
                    conn.setRequestProperty("User-Agent", "Baseball-At-Bat-Tracker")
                    val code = conn.responseCode
                    if (code !in 200..299) throw IllegalStateException("GitHub returned HTTP $code")
                    val body = conn.inputStream.bufferedReader().use { it.readText() }
                    conn.disconnect()
                    val arr = org.json.JSONArray(body)
                    val labels = ArrayList<String>(); val urls = ArrayList<String>()
                    val current = currentVersionName()
                    for (i in 0 until arr.length()) {
                        val r = arr.optJSONObject(i) ?: continue
                        if (r.optBoolean("draft", false)) continue
                        val name = releaseVersion(r.optString("tag_name", ""))
                        val apk = releaseApkUrl(r)
                        if (name.isNotBlank() && apk.isNotBlank() && name != current) {
                            labels.add(name + if (r.optBoolean("prerelease", false)) " (Testing)" else " (Official)")
                            urls.add(apk)
                        }
                    }
                    runOnUiThread {
                        if (labels.isEmpty()) { showMessage("No rollback builds with APKs were found on GitHub."); return@runOnUiThread }
                        AlertDialog.Builder(this@MainActivity).setTitle("Rollback version")
                            .setItems(labels.toTypedArray()) { _, which -> if (urls[which].isNotBlank()) downloadAndInstall(urls[which], labels[which].substringBefore(" (")) }
                            .setNegativeButton("Cancel", null).show()
                    }
                } catch (e: Exception) { runOnUiThread { showMessage("Couldn't load rollback versions.\n\n${e.message ?: "Unknown error"}") } }
            }
        }
        @JavascriptInterface fun clearUpdateCache() { File(cacheDir, "updates").deleteRecursively() }
        @JavascriptInterface fun openInstallSettings() {
            startActivity(Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:$packageName")))
        }
    }

    private fun releasesUrl(): String =
        "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/releases?per_page=20"

    private fun latestReleaseUrl(): String =
        "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/releases/latest"

    private fun releaseVersion(tag: String): String = tag.removePrefix("v").trim()

    private fun versionParts(v: String): List<Int> {
        val m = Regex("^(\\d+)\\.(\\d+)\\.(\\d+)(?:-beta\\.(\\d+))?").find(v)
        return if (m != null) listOf(
            m.groupValues[1].toInt(), m.groupValues[2].toInt(), m.groupValues[3].toInt(),
            m.groupValues.getOrNull(4)?.takeIf { it.isNotBlank() }?.toInt() ?: Int.MAX_VALUE
        ) else listOf(0, 0, 0, 0)
    }

    private fun isNewerVersion(remote: String, current: String): Boolean {
        val r = versionParts(remote)
        val c = versionParts(current)
        for (i in r.indices) if (r[i] != c[i]) return r[i] > c[i]
        return false
    }

    private fun releaseApkUrl(release: JSONObject): String {
        val assets = release.optJSONArray("assets") ?: return ""
        for (i in 0 until assets.length()) {
            val asset = assets.optJSONObject(i) ?: continue
            val name = asset.optString("name", "")
            if (name.lowercase().endsWith(".apk")) return asset.optString("browser_download_url", "")
        }
        return ""
    }

    private fun manifestUrl(channel: String): String {
        // Kept for backward compatibility with older rollback data. New update checks use Releases API.
        val branch = if (channel == "testing") TESTING_BRANCH else OFFICIAL_BRANCH
        return "https://raw.githubusercontent.com/$GITHUB_OWNER/$GITHUB_REPO/$branch/update-manifest.json?cacheBust=${System.currentTimeMillis()}"
    }

    private fun checkForUpdatesInternal(channel: String, silent: Boolean = false) {
        if (GITHUB_OWNER.isBlank() || GITHUB_REPO.isBlank()) {
            runOnUiThread { if (!silent) showMessage("Update system isn't configured yet. Check the GitHub owner and repository in MainActivity.kt.") }
            return
        }
        thread {
            try {
                val url = if (channel == "testing") releasesUrl() else latestReleaseUrl()
                val conn = URL(url).openConnection() as HttpURLConnection
                conn.connectTimeout = 10000
                conn.readTimeout = 10000
                conn.requestMethod = "GET"
                conn.setRequestProperty("Accept", "application/vnd.github+json")
                conn.setRequestProperty("X-GitHub-Api-Version", "2022-11-28")
                conn.setRequestProperty("User-Agent", "Baseball-At-Bat-Tracker")
                val code = conn.responseCode
                if (code !in 200..299) throw IllegalStateException("GitHub returned HTTP $code")
                val body = conn.inputStream.bufferedReader().use { it.readText() }
                conn.disconnect()

                val release = if (channel == "testing") {
                    val arr = org.json.JSONArray(body)
                    var found: JSONObject? = null
                    for (i in 0 until arr.length()) {
                        val r = arr.optJSONObject(i) ?: continue
                        if (!r.optBoolean("draft", false) && r.optBoolean("prerelease", false)) { found = r; break }
                    }
                    found
                } else JSONObject(body).takeUnless { it.optBoolean("draft", false) || it.optBoolean("prerelease", false) }

                if (release == null) {
                    runOnUiThread { if (!silent) showMessage("No published ${if (channel == "testing") "testing" else "official"} release was found on GitHub.") }
                    return@thread
                }

                val remoteName = releaseVersion(release.optString("tag_name", ""))
                val notes = release.optString("body", "")
                val apkUrl = releaseApkUrl(release)
                val current = currentVersionName()
                runOnUiThread {
                    if (remoteName.isNotBlank() && isNewerVersion(remoteName, current) && apkUrl.isNotBlank()) {
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
                if (!silent) runOnUiThread {
                    val detail = e.message?.takeIf { it.isNotBlank() } ?: "Unknown error"
                    showMessage("Couldn't check GitHub for updates.\n\n$detail")
                }
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
                val code = conn.responseCode
                if (code !in 200..299) {
                    conn.disconnect()
                    throw IllegalStateException("GitHub returned HTTP $code while downloading the APK")
                }
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
