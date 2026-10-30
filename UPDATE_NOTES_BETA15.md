# Beta.15 — My Player profiles

## My Player tab

The single Player name field is replaced by a list of My Player
profiles:

- Add a player by name (duplicate names are refused).
- Each profile has a stats card showing the player's name, batting
  average, hits, walks, and strikeouts, computed from that player's
  recorded at-bats across all teams.
- Tapping a card opens the Stats page filtered to that player.
- Removing a profile (×) unlinks its roster players.

Existing players carry over automatically: the old single name and
every flagged (★) roster player become profiles, and their roster
entries are linked to the matching profile.

## Team page dropdown

The My Player toggle button on each roster row is now a dropdown
listing your My Player profiles:

- Picking a profile links that roster player to the right kid, so
  their stats land on the right card.
- Picking a profile also fills in the roster row's name with that
  kid's name, as confirmed.
- Picking the "My Player…" placeholder unlinks the roster player.

## Stats page

The player picker now lists your My Player profiles (one entry per
kid, even if the kid is on more than one team) instead of individual
roster entries. At-bats from before profiles existed still appear
under "All my players" unless the recorded name matches a profile.

## Top banner

The top banner now shows the app name, "Baseball AB Tracker",
instead of a player name.

## Version

versionCode 20 / 1.3.1-beta.15. No other gameplay changes.
