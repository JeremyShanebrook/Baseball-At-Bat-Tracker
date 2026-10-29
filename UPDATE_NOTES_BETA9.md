# Baseball AB Tracker v1.3.0-beta.9

- Android `versionCode`: 12
- Android `versionName`: `1.3.0-beta.9`
- Channel: Testing (`develop`) only. Nothing in this release changes `main`.

## What this release is

A maintenance / cleanup release. **No gameplay or UI changes** — everything from beta.8 (coach-pitch counter, fifth-pitch foul rules, beta.7 runner animations and forced-only advances) is preserved, and the app's web content (`index.html`) is byte-for-byte the same logic as beta.8.

## Changes

1. **Gradle wrapper pinned from 9.3.0 to 8.10.2.** The project uses AGP 8.7.3, whose supported Gradle range is 8.9–8.10.x; Gradle 9 pairs with AGP 9.x. This makes command-line / CI builds reproducible instead of depending on a local Android Studio setup.
2. **Repository cleanup.** Added a standard Android `.gitignore` and stopped tracking generated and machine-specific files that were committed to the repo: `.gradle/`, `.idea/`, `build/`, `app/build/`, and `local.properties` (500+ files untracked; they still exist locally, just no longer in git).
3. **Removed stray file** `app/src/main/res/xml_file_paths.tmp` (empty leftover; the real `res/xml/file_paths.xml` is unchanged).
4. **Dead code removed** from `MainActivity.kt`: the unused `manifestUrl()` helper (and its branch constants) from the old manifest-based updater, and the unused `currentVersionCode()` helper. Update checks use the GitHub Releases API, as they already did in beta.8.
5. **Removed unused dependency** `androidx.webkit:webkit` — declared but never imported.
6. **Docs:** `UPDATE_SETUP.md` refreshed to describe the Releases-API update flow that the app actually uses, and the current testing manifest.
7. **Version bump:** `versionCode` 11 → 12, `versionName` `1.3.0-beta.8` → `1.3.0-beta.9`; root `update-manifest.json` and `docs/update-manifest-develop.json` updated to match.

## Validation

- JavaScript harness `runner_beta8_tests.js` passes against the unchanged app content.
- Clean command-line debug build (JDK 17, Android SDK 35, Gradle 8.10.2) succeeds; APK metadata verified: package `com.baseballabtracker.app`, versionCode 12, versionName `1.3.0-beta.9`, targetSdk 35.
- The APK's bundled `assets/index.html` is content-identical to beta.8's (LF line endings from the repo copy; beta.8 shipped the CRLF copy).

## Signing note

Beta.9 must be signed with the **same key** as beta.8 for installed testing-channel apps to update in place. Verified certificates:

- Shipped beta.8 APK: `CN=Android Debug`, SHA-256 `AB:BA:B8:A2:D2:F4:04:BD:97:F6:B1:A7:9A:BA:DD:04:6E:D5:DF:9E:E2:E1:CF:FE:DE:52:B5:E8:67:51:99:90`
- Muse's verification build: `CN=Android Debug`, SHA-256 `12:F6:77:FB:10:DC:CC:30:1B:25:24:5D:8D:F1:68:97:E9:68:15:09:32:D7:B8:EF:C3:A3:F8:EB:CF:4A:E7:A3` (a fresh machine debug key — does **not** match)

So the release APK must either be built/signed on the machine whose debug key produced beta.8, or signed with that same `debug.keystore` copied over. Signing with any other key makes Android refuse the in-place update, forcing a reinstall that clears the app's local data.
