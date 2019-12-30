const express = require("express");
const http = require("http");
const next = require("next");
const path = require("path");

const hostname = process.env.HOST || "localhost";
const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
app.prepare().then(() => {
  const srv = express();

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
});
