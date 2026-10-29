# 1.3.0 — first official (main) release

Main is now the beta.12 codebase, promoted as 1.3.0 (versionCode 16).

## What is in it

Everything that shipped across the beta channel:

- **beta.10** — team rosters (name + number), reorderable game lineups that
  persist across games, team stats for every roster player, "my player"
  auto-sync into personal stats, opponent lineups (number and name, either
  optional), walk-up music clips up to 1 minute from phone storage with a
  Play/Stop button that fades out over 3 seconds. Music follows the phone
  volume, independent of the in-app sounds setting.
- **beta.11** — walk-up music attach fix: real Add Music button, visible
  save-failure errors, on-device fallback when the app DB is unavailable,
  and "♪ Attached" indication in the roster, lineups, team stats, and
  Now Batting line.
- **beta.12** — solid navy Now Batting banner with white text; Play Music
  starts with a stadium-style announcer voice ("Now batting, number N,
  Name") generated on-phone via Android TTS with a PA echo, then the
  walk-up music. Stop cancels the announcement and music never starts.

## What is NOT in it

- The developer PIN removal (commit 97f800d) was reverted before this
  release (commit f76b815). Developer options and PIN 1990 are intact.
- The authenticated GitHub update-check commit (889f292) stays on develop
  only, unpushed. Main's update checker is the beta.12 behavior: no auth
  header, so against the now-private repo it cannot fetch releases until
  a keyed build ships. Play becomes the update channel once published.

## How main got here

Main (old tip 234bcc8, versionCode 4 / 1.3.0-beta.1) was merged up to
f76b815 (merge commit c7cf6ad), then bumped to 16 / 1.3.0. The merge
also dropped main's stale committed build artifacts (app/build/,
local.properties) that develop's .gitignore excludes.
