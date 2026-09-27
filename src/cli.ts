#!/usr/bin/env node
import { hostname, networkInterfaces } from "node:os";
import QRCode from "qrcode";
import { output } from "./helper.ts";
import { server } from "./server.ts";

const PORT = Number(process.env.PORT ?? 8765);

const bold = (s: string) => `\x1b[1m${s}\x1b[22m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[22m`;
const cyan = (s: string) => `\x1b[36m${s}\x1b[39m`;
const red = (s: string) => `\x1b[31m${s}\x1b[39m`;
const green = (s: string) => `\x1b[32m${s}\x1b[39m`;

server.on("error", async (e: NodeJS.ErrnoException) => {
  if (e.code !== "EADDRINUSE") throw e;
  const pid = (await output("lsof", ["-ti", `tcp:${PORT}`, "-sTCP:LISTEN"])).trim().split("\n")[0];
  const name = pid && (await output("ps", ["-o", "comm=", "-p", pid])).trim().split("/").pop();
  console.error(`
  ${red("●")} ${bold("Mac Remote")} ${dim("couldn't start")}

  Port ${bold(String(PORT))} is already in use${name ? ` by ${bold(name)} ${dim(`(pid ${pid})`)}` : ""}.
  Mac Remote might already be running in another terminal.

  ${dim("Stop it          ")}  ${cyan(pid ? `kill ${pid}` : `lsof -i :${PORT}`)}
  ${dim("Or use a new port")}  ${cyan(`PORT=${PORT + 1}`)} ${dim("in front of the command")}
`);
  process.exit(1);
});

server.listen(PORT, async () => {
  // Use Wi-Fi and Ethernet (en*) only. VM bridges and VPN tunnels also have IPv4 addresses.
  const ip = Object.entries(networkInterfaces())
    .filter(([name]) => name.startsWith("en"))
    .flatMap(([, addrs]) => addrs ?? [])
    .find((a) => a.family === "IPv4" && !a.internal)?.address;
  const host = hostname().toLowerCase().replace(/\.local$/, "");

  const url = `http://${host}.local:${PORT}/`;
  const qr = (await QRCode.toString(url, { type: "terminal", small: true })).replace(/^/gm, "  ");

  console.log(`
  ${green("●")} ${bold("Mac Remote")} ${dim(`is running on port ${PORT}`)}

  ${dim("Open on your phone")}  ${bold(cyan(url))}
  ${dim("Or by IP address  ")}  ${ip ? cyan(`http://${ip}:${PORT}/`) : dim("not connected to Wi-Fi")}

  ${dim("Scan with your phone camera:")}
${qr}
  ${dim("Same Wi-Fi only · Ctrl+C to stop")}
`);
});
