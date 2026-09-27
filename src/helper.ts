import { execFile } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { hostname } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
export const output = (cmd: string, args: string[]) => run(cmd, args).then((r) => r.stdout, () => "");

// NX_KEYTYPE_* codes for the media keys, and virtual key codes for plain keys.
const media: Record<string, number> = { play: 16, volup: 0, voldown: 1, mute: 7, next: 17, prev: 18 };
const keys: Record<string, number> = { back: 123, fwd: 124, full: 3 }; // ← → f: seek and fullscreen in YouTube, Netflix, VLC, IINA and QuickTime.

// The helper binary sits next to this file. If keys.swift is here too, rebuild the helper
// when it is missing or older than the source. This needs Xcode command line tools.
const bin = join(import.meta.dirname, "keys");
const src = join(import.meta.dirname, "keys.swift");
if (existsSync(src) && (!existsSync(bin) || statSync(bin).mtimeMs < statSync(src).mtimeMs)) {
  await run("swiftc", ["-O", src, "-o", bin]);
}

export const isAction = (action: string) => action in media || action in keys;

export async function press(action: string) {
  const args = action in media ? ["media", media[action]] : ["key", keys[action]];
  await run(bin, args.map(String));
}

const computer = (await output("scutil", ["--get", "ComputerName"])).trim() || hostname();

export async function status() {
  const [player, volume] = await Promise.all([output(bin, ["status"]), output("osascript", ["-e", "get volume settings"])]);
  const [app = "", rawTitle = ""] = player.trim().split("\t");
  // "Netflix - Audio playing - Brave" → "Netflix"
  const title = rawTitle
    .replace(/ - Audio playing/, "")
    .replace(/ [-—] (Brave|Google Chrome|Mozilla Firefox|Microsoft Edge|Arc)( \(Private\))?$/, "");
  return {
    computer,
    app: app || null,
    title: title || null,
    volume: Number(volume.match(/output volume:(\d+)/)?.[1] ?? 0),
    muted: volume.includes("output muted:true"),
  };
}
