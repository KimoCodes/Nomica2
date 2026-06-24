import "dotenv/config";
import { createServer } from "http";
import next from "next";
import { initializeSocketServer } from "./server/socket/server";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME ?? "localhost";
const port = parseInt(process.env.PORT ?? "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  initializeSocketServer(httpServer);

  httpServer.listen(port, () => {
    console.log(`> NoMica ready on http://${hostname}:${port}`);
  });
});
