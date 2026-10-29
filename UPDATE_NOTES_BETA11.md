# Beta 11 — 1.3.0-beta.11 (versionCode 14)

Fix release for walk-up music (beta.10 feature).

## Fixed
- **Music clips now actually attach.** In beta.10, picking a clip could fail
  silently — the app dropped back to the Team page with nothing attached and
  no message. The save step had no error handling: if reading the clip's
  length or writing to the app database failed, the whole save died quietly.
  Failures now show a message saying what went wrong instead of vanishing.
- **Storage fallback.** If the app database is unavailable on the phone,
  clips now fall back to the app's regular on-device storage, so attaching
  doesn't depend on one storage path working.
- **Picker wiring.** The per-player hidden file input inside a label is
  replaced by a real "Add music" button driving one shared picker, which is
  far less fragile across Android WebView versions.

## Attached-clip indication
- A music note (♪) now marks any player with a clip attached: in the roster
  ("♪ Attached: <clip name>"), in the game-start lineup, in the in-game
  lineup menu, in Team Stats, and on the "Now batting" line in game (next
  to the Play Music button).

## Notes
- The 1-minute limit, 3-second fade on Stop, and phone-volume independence
  from the in-app sounds setting are unchanged from beta.10.
