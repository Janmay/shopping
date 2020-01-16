const express = require("express");
const next = require("next");
const helmet = require("helmet");
const uuidv4 = require("uuid/v4");

const hostname = process.env.HOST || "localhost";
const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

process.env.cspNonce = Buffer.from(uuidv4()).toString("base64");

app.prepare().then(() => {
  const srv = express();

  csp(srv);

  srv.use(handle);

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

function csp(app) {
  const nonce = (req, res) => `'nonce-${res.locals.nonce}'`;
  const scriptSrc = [nonce, "'strict-dynamic'"];
  // const styleSrc = [nonce];

  if (dev) {
    scriptSrc.push("'unsafe-inline'");
    // styleSrc.push("'unsafe-inline'");
  }

  app.use((req, res, next) => {
    res.locals.nonce = process.env.cspNonce;
    next();
  });

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          baseUri: ["'none'"],
          objectSrc: ["'none'"],
          scriptSrc
          // styleSrc,
        }
      }
    })
  );
}
