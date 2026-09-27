# Mac Remote

Control your Mac's media from your phone: play/pause, seek, volume, mute and fullscreen. Made for watching movies from bed.

## Setup

1. Install [Bun](https://bun.com) and the Xcode command line tools (`xcode-select --install`).
2. Give your terminal **Accessibility** permission: System Settings → Privacy & Security → Accessibility.

## Run

```bash
bun install
bun start
```

Scan the QR code with your phone, or open `http://<your-mac-name>.local:8765/`. Your phone must be on the same Wi-Fi as the Mac.

Tip: in Safari, tap Share → **Add to Home Screen** to use it like an app.

## Good to know

- Seek and fullscreen work in YouTube, Netflix, VLC, IINA and QuickTime. Play/pause and volume work everywhere.
- Open the remote on your phone only. Opening it on the Mac takes focus away from the video.
- Keep your Mac awake while watching: `caffeinate -i bun start`.
- There's no login, so keep it on your home network.
