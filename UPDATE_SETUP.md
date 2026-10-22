# Baseball AB Tracker — GitHub update setup

## Important: the repository currently needs this structure

The public repository is `JeremyShanebrook/Baseball-At-Bat-Tracker`.
Both branches carry the full Android project source (APKs are distributed through GitHub Releases, not the repo tree). Generated and machine-specific files (`.gradle/`, `.idea/`, `build/`, `app/build/`, `local.properties`) are covered by `.gitignore` and must not be committed.

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

As of v1.3.0-beta.9, the root `update-manifest.json` on `develop` is configured for:

```text
versionCode: 12
versionName: 1.3.0-beta.9
APK:
https://github.com/JeremyShanebrook/Baseball-At-Bat-Tracker/releases/download/v1.3.0-beta.9/Baseball-At-Bat-Tracker-v1.3.0-beta.9.apk
```

Keep the manifest on `develop` in step with the newest beta release: bump it in the same commit that bumps `versionCode`/`versionName`, and upload the matching APK to the GitHub prerelease.

## Current official manifest template

`docs/update-manifest-main.json` is the template for `main`. Do not put a future version number in `main` until that official release actually exists.

## Update checker behavior

Since beta.8 the Android app checks updates through the **GitHub Releases API** (the older raw-manifest check was removed in beta.9 cleanup; the manifest JSON files are still maintained for reference/rollback tooling):

- Official channel: `GET /repos/JeremyShanebrook/Baseball-At-Bat-Tracker/releases/latest` — GitHub's "latest" is always a full (non-prerelease) release, fed from `main`.
- Testing channel: `GET /repos/JeremyShanebrook/Baseball-At-Bat-Tracker/releases?per_page=20` — the app takes the newest prerelease, fed from `develop`.

It compares the release tag's version against the installed version name. If the remote version is newer and the release has an `.apk` asset, it offers to download and install it. The rollback dialog (developer menu) lists other releases with APKs the same way.

The app also reports the HTTP error returned by GitHub, which makes a missing release much easier to diagnose than a generic "check your internet connection" message.

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
