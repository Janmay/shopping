const express = require("express");
const http = require("http");
const next = require("next");
const path = require("path");
const DataHub = require("macaca-datahub");
const datahubMiddleware = require("datahub-proxy-middleware");

// macaca datahub
const datahubConfig = {
  port: 5678,
  hostname: "127.0.0.1",
  store: path.resolve(process.cwd(), "data"),
  proxy: {
    "^/api": {
      hub: "shopping",
      port: 5678,
      rewrite: "^/api"
    }
  },
  showBoard: false
};

const defaultDatahub = new DataHub({
  port: datahubConfig.port
});

const hostname = process.env.HOST || "localhost";
const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
app.prepare().then(() => {
  const srv = express();
  datahubMiddleware(srv)(datahubConfig);

  srv.all("*", app.getRequestHandler());

  srv.listen(port, hostname, err => {
    if (err) {
      console.error(
        err.code === "EADDRINUSE" ? `Port ${port} is already in use.` : err
      );
    } else {
      console.log(`> Ready on http://${hostname}:${port}`);
    }
  });

  defaultDatahub.startServer(datahubConfig).then(() => {});
});
