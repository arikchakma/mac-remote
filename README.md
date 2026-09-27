# Mac Remote

Control your Mac's media from your phone: play/pause, seek, volume, mute and fullscreen. Made for watching movies from bed.

## Usage

```bash
npx @arikchakma/mac-remote
```

Scan the QR code with your phone, or open `http://<your-mac-name>.local:8765/`. Your phone must be on the same Wi-Fi as the Mac.

The first time, give your terminal **Accessibility** permission: System Settings → Privacy & Security → Accessibility.

Tip: in Safari, tap Share → **Add to Home Screen** to use it like an app.

Requires macOS and Node 20.11 or later.

## Good to know

- Seek and fullscreen work in YouTube, Netflix, VLC, IINA and QuickTime. Play/pause and volume work everywhere.
- Open the remote on your phone only. Opening it on the Mac takes focus away from the video.
- Keep your Mac awake while watching: `caffeinate -i npx @arikchakma/mac-remote`.
- Use another port with `PORT=9000 npx @arikchakma/mac-remote`.
- There's no login, so keep it on your home network.

## Development

Needs [Bun](https://bun.com) and the Xcode command line tools (`xcode-select --install`).

```bash
bun install
bun start        # run from source
bun run build    # build dist/ for the package
```

## License

MIT © Arik Chakma. See [LICENSE](LICENSE).
