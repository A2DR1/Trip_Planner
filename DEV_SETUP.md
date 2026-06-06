# TripMate — Development & Device Setup Guide

A self-contained record of how the TripMate (Expo / React Native) app was fixed,
built, and deployed to a physical iPhone — including every bug hit along the way
and how each was resolved.

- **Project:** TripMate — student trip planner
- **Stack:** Expo SDK 55, React Native 0.83.6, React 19.2, Expo Router, Firebase, Zustand
- **Package manager:** yarn (npm lockfiles intentionally removed — see §1)
- **Target:** Physical iPhone (iOS 26.5) via a **development build** (not Expo Go)

---

## TL;DR — How to run the app day-to-day

Once everything below is set up, the normal workflow is just two things:

```bash
cd /Users/austinshen/Documents/Programming/Trip_Planner
yarn start
```

Then open the **TripMate** app (the custom dev build) on the phone. It connects to
the Metro bundler automatically over Wi-Fi (Mac and phone must be on the same network).

You only need to rebuild with `npx expo run:ios --device` when **native** code or
dependencies change. Plain JS/TS edits hot-reload instantly — no rebuild needed.

---

## Background: why these bugs kept happening

Two root causes were behind almost every error:

1. **Dependency drift.** `package.json` used caret (`^`) ranges on Expo-managed
   packages, so installs pulled newer versions than Expo SDK 55 supports. On top of
   that, the project had **both** a `package-lock.json` (npm) and a `yarn.lock`
   (yarn). Each tool ignored the other's lockfile, so every install could resolve
   different versions → constant incompatibility warnings.

2. **Expo Go can't run this app.** The app uses the **New Architecture**
   (`newArchEnabled: true`) plus native modules. Expo Go is a generic prebuilt
   sandbox and cannot load custom native config — hence the persistent
   *"Project is incompatible with this version of Expo Go"* error, no matter how
   up-to-date Expo Go was. The fix was to stop using Expo Go and build a
   **custom development build** installed directly on the device.

---

## 1. Fix dependency versions & lockfile conflict

**Symptom**

```
The following packages should be updated for best compatibility with the installed expo version:
  @react-native-async-storage/async-storage@3.0.2 - expected version: 2.2.0
  expo-status-bar@3.0.9 - expected version: ~55.0.6
  react@19.1.0 - expected version: 19.2.0
  react-native@0.81.5 - expected version: 0.83.6
  ... (and several more)
Your project may not work correctly until you install the expected versions of the packages.
```

**Fix**

```bash
# Align every Expo-managed package to the exact versions SDK 55 expects
npx expo install --fix

# Remove the stale npm lockfile so only yarn.lock remains (commit to ONE manager)
rm package-lock.json
```

`expo install --fix` rewrote the version ranges (e.g. `react-native` → `0.83.6`,
`react` → `19.2.0`, `expo-status-bar` → `~55.0.6`) and reinstalled via yarn.

**Going forward:** always add deps with `npx expo install <pkg>` or `yarn add <pkg>`.
**Never** use `npm install` here — it regenerates the conflicting `package-lock.json`.

> ⚠️ Note: `expo start` only reads what's in `node_modules`. After fixing in a git
> worktree, the main project folder still had old packages until `yarn install` was
> re-run there. If warnings persist, run `yarn install` in the actual project root.

---

## 2. Stop using Expo Go → switch to a development build

**Symptom** (persisted even with the latest Expo Go installed):

```
ERROR  Project is incompatible with this version of Expo Go
The project you requested requires a newer version of Expo Go.
```

**Why:** `app.json` has `"newArchEnabled": true` and the project uses custom native
modules. Expo Go cannot run either. (Setting `newArchEnabled: false` did **not** fix
Expo Go for this project, so we committed to a development build instead.)

**Fix — install the dev-client and required peer deps**

```bash
npx expo install expo-dev-client

# react-native-reanimated v4 needs this peer dependency, or pod install fails
npx expo install react-native-worklets
```

The reanimated failure looked like:

```
[!] Invalid `RNReanimated.podspec` file: [Reanimated] Failed to validate worklets version.
```

…which was resolved by installing `react-native-worklets`.

---

## 3. One-time native build prerequisites (macOS / Xcode / iPhone)

Building to a real device required a chain of environment fixes. Each is one-time.

### 3a. Xcode must support the phone's iOS version

**Symptom**

```
error: iOS 26.5 is not installed. Please download and install the platform
from Xcode > Settings > Components.
```

(An older Xcode also misreported iOS 26 as "iOS 18.5" because it didn't recognize
the new version at all.)

**Fix**
1. Update **Xcode** from the Mac App Store to the latest version.
2. In Xcode → **Settings → Components** (older: **Settings → Platforms**), download
   the **iOS 26.x** platform support.

> Building to a **physical device** does NOT require the iOS Simulator runtime
> (~7 GB). It only needs the device platform support files, which come with Xcode.

### 3b. Updating Xcode required a newer macOS

The latest Xcode wouldn't install on the old macOS, so macOS had to be upgraded
first (to **macOS Tahoe 26.x**).

- **Hardware check:** MacBook Pro (M2, 8 GB RAM) — fully supported, safe to upgrade.
  Apple Silicon handles current macOS fine; no meaningful battery/heat penalty.
- **Storage gotcha:** a macOS upgrade needs ~20+ GB free. The machine only had
  ~11 GB, which can cause the installer to silently fail / vanish after "Preparing".

**Freeing space — the big win was old Lean toolchains:**

```bash
# This directory was 52 GB with 25 installed toolchains
du -sh ~/.elan

# Remove toolchains not referenced by any project's lean-toolchain file
# (kept: v4.5.0-rc1, v4.19.0, v4.21.0, v4.22.0-rc3, v4.24.0-rc1, v4.25.1,
#        v4.26.0-rc1, v4.26.0-rc2, v4.28.0, dsp-patched)
elan toolchain uninstall leanprover/lean4:v4.8.0
elan toolchain uninstall leanprover/lean4:v4.14.0
elan toolchain uninstall leanprover/lean4:v4.23.0-rc2
elan toolchain uninstall leanprover/lean4:v4.27.0-rc1
# ...plus all 12 unused nightly builds → freed ~33 GB total
```

> Tip: `df -h /` shows free space. To find what a project actually needs:
> `find ~/Documents -name lean-toolchain -exec cat {} \;`

> Note: the macOS "About X minutes remaining" during "Preparing …" is wildly
> inaccurate and can sit at "5 minutes" for 30–60+ min. Don't force-restart unless
> the progress bar is frozen for 45+ min.

### 3c. Enable Developer Mode on the iPhone

**Symptom**

```
error: Developer Mode disabled. To use [iPhone] for development,
enable Developer Mode in Settings → Privacy & Security.
```

**Fix (on the phone)**
1. **Settings → Privacy & Security → Developer Mode** → toggle **on**
2. Restart the phone when prompted, then confirm **Turn On** after reboot.

---

## 4. Code signing (free Apple ID)

A paid developer account is **not** required — a free Apple ID can sideload to your
own device (re-sign needed roughly every 7 days).

**Setup in Xcode**
1. Open the workspace:
   ```bash
   open ios/TripMate.xcworkspace
   ```
2. Xcode → **Settings → Accounts** → **+** → sign in with your Apple ID.
3. Select the **TripMate** target → **Signing & Capabilities** tab.
4. Check **Automatically manage signing** and pick your **Team**
   (e.g. *Austin Shen (Personal Team)*).

### Bundle identifier collision

**Symptom**

```
Failed Registering Bundle Identifier
The app identifier "com.tripmate.app" cannot be registered to your development
team because it is not available.
```

`com.tripmate.app` was already taken on Apple's servers. **Fix:** change to a unique
ID in `app.json`:

```jsonc
// app.json
"ios":     { "bundleIdentifier": "com.austinshen.tripmate" },
"android": { "package":          "com.austinshen.tripmate" }
```

Then regenerate native projects and rebuild:

```bash
npx expo prebuild --clean
npx expo run:ios --device
```

`prebuild --clean` wipes and regenerates the `ios/` and `android/` folders from
`app.json`, picking up the new bundle ID.

---

## 5. First launch — trust the certificate

The build succeeded and installed, but the first auto-launch failed with:

```
Unable to launch com.austinshen.tripmate because it has an invalid code signature,
inadequate entitlements or its profile has not been explicitly trusted by the user.
```

…and on the phone: **"Untrusted Developer"** (不受信任的开发者).

**Fix (on the phone)**
1. **Settings → General → VPN & Device Management**
2. Under **Developer App**, tap **Apple Development: austin031117@icloud.com**
3. Tap **Trust**, then confirm.

Now the **TripMate** app launches normally.

---

## 6. "No development servers found"

After opening the app, it showed *No development servers found* because the Metro
bundler wasn't running (it had stopped after the earlier launch error).

**Fix**

```bash
yarn start
```

The app connects automatically. If it doesn't, **shake the phone** to open the dev
menu → **Connect to Metro** (or enter the URL shown in the terminal, e.g.
`exp+tripmate://expo-development-client/?url=http://10.0.0.80:8081`).

---

## Quick reference

| Need | Command |
|------|---------|
| Start Metro (daily) | `yarn start` |
| Rebuild native app to phone | `npx expo run:ios --device` |
| Add a dependency | `npx expo install <pkg>` (never `npm install`) |
| Realign deps to SDK | `npx expo install --fix` |
| Regenerate native projects | `npx expo prebuild --clean` |
| Open native project in Xcode | `open ios/TripMate.xcworkspace` |

## Key config values

| Item | Value |
|------|-------|
| Expo SDK | 55 |
| React Native | 0.83.6 |
| React | 19.2.0 |
| iOS bundle identifier | `com.austinshen.tripmate` |
| Android package | `com.austinshen.tripmate` |
| New Architecture | enabled (`newArchEnabled: true`) |
| Signing team | Austin Shen (Personal Team) — free Apple ID |
| Apple ID for signing | austin031117@icloud.com |

## Gotchas to remember

- **yarn only.** Don't run `npm install` — it recreates `package-lock.json` and
  reintroduces version drift.
- **Expo Go won't work** for this app (New Architecture + native modules). Always use
  the custom **TripMate** development build.
- **Free signing expires** ~every 7 days; re-run `npx expo run:ios --device` to
  re-sign when the app refuses to open.
- **Same Wi-Fi.** Phone and Mac must share a network for Metro to connect.
- **JS changes** hot-reload; only **native** changes need a rebuild.
