# Beta 12 — 1.3.0-beta.12 (versionCode 15)

Announcer intro + Now Batting banner restyle.

## Now Batting banner
- The banner that shows the current batter and the Play/Stop Music button
  is now a solid navy bar with white text, instead of the faint translucent
  background it had before, so it stands out from the rest of the game card.
  The button text stays dark on its light button so it stays readable.

## Announcer intro before walk-up music
- Pressing Play Music now starts with an announcer voice saying
  "Now batting, number N, Name" — with the MLB-style delivery Jeremy picked
  (pauses between each piece, name emphasized) and a PA-system echo —
  and then the walk-up music plays.
- The number and name come from the roster automatically for whoever is
  actually at bat. The example in testing was "Now batting, number 11,
  Joseph"; in a real game it says the real batter. A player with no number
  on the roster is announced by name only.
- The announcement is generated live on the phone (names and numbers change
  every at-bat), using the phone's own speech engine styled the same way —
  pauses, name emphasis, PA echo — so it sounds close to the approved
  sample but is not the sample recording itself.
- Stop works the same as before: pressing Stop during the announcement
  cancels it and the music never starts; pressing Stop during the music
  still fades it out over 3 seconds. If the batter changes mid-announcement,
  the announcement is cancelled too.
- Volume follows the same rule as walk-up music: the announcement plays at
  the phone's volume and is independent of the in-app sounds setting, so
  turning in-app sounds off does not silence it.
- If the phone can't render speech for any reason, the announcement is
  skipped and the music plays as before — the music never gets blocked by
  an announcement failure.

## Notes
- The 1-minute clip limit, the ♪ attached-clip marks, and the
  localStorage fallback from beta.11 are unchanged.
