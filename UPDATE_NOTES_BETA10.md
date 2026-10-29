# Beta 10 — 1.3.0-beta.10 (versionCode 13)

Feature release: team rosters, game lineups, team stats, and walk-up music.

## What's new
- **Team roster (Team section):** add players with a name and number per team.
- **Lineup:** roster order is the batting order. Reorder with up/down arrows in Team
  setup, again at game start, and mid-game from the new Lineup button. Changes save
  to the team and persist across games until changed again. Benched players stay on
  the roster and can return to the lineup.
- **My Player toggle:** flag your player on the roster. When they come up to bat,
  their at-bats feed the personal player stats automatically (the existing mirror).
- **Opponent lineup:** number + name fields at game start; either or both optional.
  The current opponent batter is shown during their half.
- **Team stats:** a per-player stats table on the Team page, from team games
  (active and finished). Past manual games were never recorded per-player, so team
  stats start from team games played on beta.10 or later.
- **Walk-up music:** pick a clip (up to 1 minute) from phone storage per player.
  When that player comes up to bat, a Play Music button appears; while playing it
  becomes Stop Music, and Stop fades the music out over 3 seconds instead of
  cutting it. Music follows the phone's volume and is independent of the app's
  in-app sounds setting — turning app sounds off does not silence walk-up music.
  The Android shell now implements a file chooser so the picker works (previously
  the WebView used a default client with no file picker).

## Notes
- Finished active games are now archived (with per-player at-bats) so team stats
  keep their history after a game ends. Undo still restores the pre-end state.
- Teams without a roster keep the old manual My Player toggle behavior.
