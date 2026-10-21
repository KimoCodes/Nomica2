import "dotenv/config";
import { createServer } from "http";
import next from "next";
import { initializeSocketServer } from "./server/socket/server";
import { env } from "./lib/env";
import logger from "./lib/logger";

const dev = env.server.NODE_ENV !== "production";
const hostname = env.server.HOSTNAME ?? "localhost";
const port = parseInt(env.server.PORT ?? "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

function getRouteGroup(url: string | undefined) {
  const pathname = new URL(url ?? "/", `http://${hostname}`).pathname;
  if (pathname === "/") return "/";
  if (pathname.startsWith("/api/")) return `/${pathname.split("/")[1]}/${pathname.split("/")[2]}`;

  const [first, second] = pathname.split("/").filter(Boolean);
  if (!first) return "/";
  if (["client", "coach", "admin"].includes(first)) return second ? `/${first}/:page` : `/${first}`;
  return second ? `/${first}/:param` : `/${first}`;
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    if (process.env.PERFORMANCE_TIMING === "1") {
      const startedAt = performance.now();
      const route = getRouteGroup(req.url);

      res.once("finish", () => {
        logger.info({
          method: req.method,
          route,
          status: res.statusCode,
          durationMs: Number((performance.now() - startedAt).toFixed(1)),
        }, "http.request");
      });
    }

    handle(req, res);
  });

  initializeSocketServer(httpServer);

  httpServer.listen(port, () => {
    console.log(`[NomiTips] Server ready on http://${hostname}:${port} [${env.server.NODE_ENV}]`);
  });
});
