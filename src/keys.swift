// Usage: keys media <NX_KEYTYPE>  |  keys key <virtual key code>  |  keys status
import Cocoa

let players = [
  "com.brave.Browser", "com.google.Chrome", "com.apple.Safari", "company.thebrowser.Browser",
  "org.mozilla.firefox", "com.microsoft.edgemac", "org.videolan.vlc", "com.colliderli.iina",
  "com.apple.QuickTimePlayerX",
]

func title(_ w: AXUIElement) -> String? {
  var t: CFTypeRef?
  AXUIElementCopyAttributeValue(w, kAXTitleAttribute as CFString, &t)
  return t as? String
}

typealias Player = (app: NSRunningApplication, windows: [AXUIElement], playing: AXUIElement?)

// Picks the player to control, in this order: a player with a window that plays sound,
// the frontmost player, then the first running player.
// Chromium browsers title the sound window "… - Audio playing - …".
func findPlayer() -> Player? {
  let front = NSWorkspace.shared.frontmostApplication
  let candidates: [Player] = players.compactMap { id in
    NSWorkspace.shared.runningApplications.first { $0.bundleIdentifier == id }
  }.map { app in
    var wins: CFTypeRef?
    AXUIElementCopyAttributeValue(AXUIElementCreateApplication(app.processIdentifier), kAXWindowsAttribute as CFString, &wins)
    let windows = wins as? [AXUIElement] ?? []
    return (app, windows, windows.first { title($0)?.contains("Audio playing") == true })
  }
  return candidates.first { $0.playing != nil } ?? candidates.first { $0.app == front } ?? candidates.first
}

let args = CommandLine.arguments

if args.count == 2, args[1] == "status" {
  // Prints "<app name>\t<window title>", or nothing when no player is running.
  if let p = findPlayer() {
    print("\(p.app.localizedName ?? "")\t\((p.playing ?? p.windows.first).flatMap(title) ?? "")")
  }
  exit(0)
}

guard args.count == 3, let code = Int(args[2]) else { exit(1) }

// macOS sends plain keys to the frontmost window. Bring the player and its sound window to the front first.
if args[1] == "key", let p = findPlayer() {
  if let playing = p.playing, p.windows.first.map({ !CFEqual($0, playing) }) ?? true {
    AXUIElementPerformAction(playing, kAXRaiseAction as CFString)
    usleep(150_000)
  }
  if p.app != NSWorkspace.shared.frontmostApplication { p.app.activate(); usleep(250_000) } // The window needs time to become key.
}

for down in [true, false] {
  if args[1] == "media" {
    let ev = NSEvent.otherEvent(
      with: .systemDefined, location: .zero,
      modifierFlags: NSEvent.ModifierFlags(rawValue: down ? 0xa00 : 0xb00),
      timestamp: 0, windowNumber: 0, context: nil, subtype: 8,
      data1: (code << 16) | ((down ? 0xa : 0xb) << 8), data2: -1)
    ev?.cgEvent?.post(tap: .cghidEventTap)
  } else {
    CGEvent(keyboardEventSource: nil, virtualKey: CGKeyCode(code), keyDown: down)?.post(tap: .cghidEventTap)
  }
}
usleep(50_000) // macOS drops the events if the process exits right after posting them.
