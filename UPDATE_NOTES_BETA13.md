# 1.3.0-beta.13 — cross-channel updates

## The problem

The update checker only offered a release when its version sorted NEWER
than the installed build (`isNewerVersion`). That broke switching
channels: an official release (`1.3.0`) sorts above any `1.3.0-beta.N`,
so a phone on main 1.3.0 would never be offered a testing build, and a
phone on a testing build could not be offered an official build that
sorted lower. Moving back and forth between the two channels did not work.

## The fix

The checker now offers the selected channel's latest release whenever it
is not the exact build installed (`remoteName != current`), regardless
of which direction the version sorts. Only an identical version name
counts as up to date. This is the same identity comparison the rollback
list already used.

Result, with the channel toggle in Settings (developer options, PIN):

- On testing beta.12, switch to Official → offered main 1.3.0.
- On main 1.3.0, switch to Testing → offered the latest beta.
- On a beta, switch to Official → offered the official build even
  though it sorts lower.
- On either channel with that channel's build installed → up to date.

`isNewerVersion` / `versionParts` are removed (now unused).

## Version

versionCode 17 / 1.3.0-beta.13 (16 is main's 1.3.0). No gameplay changes.
The authenticated update-check commit (889f292) is still in this build
with a blank token, so it behaves exactly as before against a public
repo; it only matters if the repo goes private again.
