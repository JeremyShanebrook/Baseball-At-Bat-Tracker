# 1.3.1 — cross-channel updates on main

Beta.13 fixed the update checker on the testing channel, but the
official build (1.3.0) still had the old rule: it only offered a
release when its version sorted NEWER than the installed build. Since
`1.3.0` sorts above any `1.3.0-beta.N`, a phone on main could never be
offered a testing build, so the official/testing loop was only half
automatic.

1.3.1 carries the beta.13 rule to main: the selected channel's latest
release is offered whenever it is not the exact build installed, in
either direction. Because `1.3.1` sorts above `1.3.0`, phones on 1.3.0
are offered this release by the old rule, and from 1.3.1 onward every
channel switch auto-offers that channel's build.

No gameplay changes. The authenticated update-check commit (889f292)
is NOT in this build (it stays on develop only); against the public
repo the unauthenticated checker works on both channels.
