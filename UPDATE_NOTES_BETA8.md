# Baseball AB Tracker v1.3.0-beta.8

- Android `versionCode`: 11
- Android `versionName`: `1.3.0-beta.8`

## Changes

1. Added a coach-pitch counter to the live count display, using the same yellow dots as the strike counter. It appears for coach-pitch at-bats in innings 1–3 and when a kid-pitch at-bat transitions to coach relief after four balls.
2. Coach-pitch pitches are counted per at-bat. The counter starts at zero on coach-relief entry and resets when the next at-bat begins. It stays hidden during kid-pitch at-bats.
3. A foul on pitch five does not end a coach-pitch at-bat. A ball or strike on pitch five ends the at-bat as an out; a third strike still ends it immediately.
4. Kid-pitch has no five-pitch limit. A foul with two strikes leaves the batter alive.
5. Preserves beta.7 runner route animations, prompt cancellation, and forced-only walk/HBP advances.

## Validation

- JavaScript syntax check passed for the app's inline script and the beta.8 scenario harness.
- The beta.8 scenario harness covers coach-pitch innings 1–3, kid-pitch, four-ball coach-relief transition, fifth-pitch foul, ball and strike on pitch five, a kid-pitch foul with two strikes, and counter visibility/reset.
- Existing beta.7 and runner-flow harnesses are included with the project.
- Android Studio debug APK build passed. Output metadata confirms versionCode 11 and versionName `1.3.0-beta.8`.
