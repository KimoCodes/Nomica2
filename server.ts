import "dotenv/config";
import { createServer } from "http";
import next from "next";
import { initializeSocketServer } from "./server/socket/server";
import { env } from "./lib/env";

const dev = env.server.NODE_ENV !== "production";
const hostname = env.server.HOSTNAME ?? "localhost";
const port = parseInt(env.server.PORT ?? "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer();

  initializeSocketServer(httpServer);

  httpServer.on("request", (req, res) => {
    handle(req, res);
  });

  httpServer.listen(port, () => {
    console.log(`[NomiTips] Server ready on http://${hostname}:${port} [${env.server.NODE_ENV}]`);
  });
});
