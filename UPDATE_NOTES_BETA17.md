# Beta.17 — In Game start button + sidebar backdrop tap

## In Game tab

When no game is active, the tab said "No active game. Start one
below." but offered no button. It now has a Start a Game button
right below that message. The button only appears when no game is
active; once a game starts, the tab shows the game card instead.

## Sidebar

Tapping outside the open sidebar now closes it. The backdrop
already covered the rest of the screen, but taps on it did nothing
because the tap handler only handled buttons; it now closes the
sidebar first.

## Version

versionCode 22 / 1.3.1-beta.17. No other changes.
