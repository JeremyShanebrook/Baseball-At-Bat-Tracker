# Baseball AB Tracker update system

## Current project configuration
- GitHub owner: `JeremyShanebrook`
- GitHub repository: `Baseball-At-Bat-Tracker`
- Developer PIN: `1990`
- Official branch: `main`
- Testing branch: `develop`
- Current build: `1.2.0` / versionCode `3`

## One-time setup
1. Keep `main` for official releases and `develop` for testing releases.
2. Put `update-manifest.json` in both branches. The manifest on `main` describes the latest official APK. The manifest on `develop` describes the latest testing APK.
3. Upload each APK to a GitHub Release and make the manifest `apkUrl` point to the exact Release asset.
4. Increment `versionCode` for every APK build. Android requires a higher version code for an update.
5. Keep the release signing keystore safe. Every future update for an installed release must use the same signing key.

## Suggested release flow
- Testing: push changes to `develop`, build a beta APK, publish a beta GitHub Release, then update the `develop` manifest.
- Official: after testing, merge `develop` into `main`, build the official APK, publish the official GitHub Release, then update the `main` manifest.
- Testers enable Testing in Developer Options. The app checks the `develop` manifest.

## Feedback
Bug and feature buttons open GitHub's new-issue page with prefilled labels. No GitHub token is stored in the APK.

## Rollback
Add older APK entries to the `previous` array. Developer Options > Rollback reads that list and launches Android's normal APK installer. Android may require the user to allow this app to install unknown apps.

## Data controls
Settings includes separate clear-data actions for Player Stats, Player, Team, Game History, and All Data. Export a backup before using a destructive action.

## Important
The app cannot silently replace itself. Android controls APK installation. Users will see the normal Android installer/permission flow.
