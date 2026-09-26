# Baseball AB Tracker — GitHub update setup

## Important: the repository currently needs this structure

The public repository is `JeremyShanebrook/Baseball-At-Bat-Tracker`.
At the moment it only has `app-debug.apk` on `main`. That is not enough for the app's update checker.

Use the following structure on BOTH branches:

```text
Baseball-At-Bat-Tracker/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── AndroidManifest.xml
│   │       ├── assets/
│   │       ├── java/
│   │       └── res/
│   ├── build.gradle.kts
│   └── proguard-rules.pro
├── docs/
│   ├── update-manifest-main.json
│   └── update-manifest-develop.json
├── app.js
├── build.gradle.kts
├── gradle.properties
├── settings.gradle.kts
├── update-manifest.json
├── UPDATE_SETUP.md
├── gradlew
├── gradlew.bat
└── gradle/
    └── wrapper/
        ├── gradle-wrapper.jar
        └── gradle-wrapper.properties
```

Do NOT put APKs in the normal repository tree.

## Branches

### `main`
Official/release source. Its root `update-manifest.json` must describe the newest OFFICIAL release.

### `develop`
Testing source. Its root `update-manifest.json` must describe the newest BETA/testing release.

The app chooses the manifest by channel:

- Official → `main/update-manifest.json`
- Testing → `develop/update-manifest.json`

## APKs belong in GitHub Releases

Build the APK in Android Studio, then create a GitHub Release and upload the APK under that release's **Assets** area. GitHub Releases are specifically intended for distributing deployable software and binary files. Do not commit `app-debug.apk` into the repository tree. See GitHub's release documentation for the release/asset workflow.

Example testing release:

```text
Tag: v1.3.0-beta.1
Title: Baseball AB Tracker v1.3.0-beta.1
Pre-release: YES
Asset:
  Baseball-At-Bat-Tracker-v1.3.0-beta.1.apk
```

Example official release:

```text
Tag: v1.3.0
Title: Baseball AB Tracker v1.3.0
Pre-release: NO
Asset:
  Baseball-At-Bat-Tracker-v1.3.0.apk
```

## Current testing manifest

This project contains a `update-manifest.json` configured for:

```text
versionCode: 4
versionName: 1.3.0-beta.1
APK:
https://github.com/JeremyShanebrook/Baseball-At-Bat-Tracker/releases/download/v1.3.0-beta.1/Baseball-At-Bat-Tracker-v1.3.0-beta.1.apk
```

Put this version of `update-manifest.json` on `develop` when the beta APK has been uploaded.

## Current official manifest template

`docs/update-manifest-main.json` is the template for `main`. Do not put a future version number in `main` until that official release actually exists.

## Update checker behavior

The Android app reads:

```text
https://raw.githubusercontent.com/JeremyShanebrook/Baseball-At-Bat-Tracker/main/update-manifest.json
```

for the official channel, or the same path with `develop` for testing.

It compares `versionCode`. If the remote value is higher, it offers the APK URL from the manifest.

The current Android code also reports the HTTP error returned by GitHub, which makes a missing manifest much easier to diagnose than the previous generic "check your internet connection" message.

## Update workflow

1. Make changes on `develop`.
2. Increase `versionCode` and set a beta version name.
3. Build the APK in Android Studio.
4. Create a GitHub pre-release, for example `v1.3.0-beta.1`.
5. Upload `Baseball-At-Bat-Tracker-v1.3.0-beta.1.apk` to the release Assets.
6. Put the matching `update-manifest.json` on `develop`.
7. Testers on the Testing channel can check for the update.
8. When testing is complete, merge the code into `main`.
9. Build a new official APK with a higher `versionCode`.
10. Create the official GitHub release and upload its APK.
11. Update `main/update-manifest.json` to point to that release.

## Never put signing keys or passwords in GitHub

Keep the Android signing keystore and its passwords outside the repository. Every update distributed to users must be signed with the same release key as the installed app.
