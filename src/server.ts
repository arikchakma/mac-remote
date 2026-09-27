import { createServer } from "node:http";
import { isAction, press, status } from "./helper.ts";
import index from "./index.html" with { type: "text" };

export const server = createServer(async (req, res) => {
  const path = (req.url ?? "/").split("?")[0]!;

  if (req.method === "GET" && path === "/") {
    return res.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end(index);
  }
  if (req.method === "GET" && path === "/status") {
    return res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(await status()));
  }

  const action = path.slice(1);
  if (req.method !== "POST" || !isAction(action)) return res.writeHead(404).end();
  try {
    await press(action);
    res.writeHead(204).end();
  } catch {
    res.writeHead(500).end();
  }
});
