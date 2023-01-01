require("dotenv").config();
const express = require("express");
const cache = require("express-redis-cache")({ prefix: "proxy", host: process.env.REDISHOST, port: process.env.REDISPORT, auth_pass: process.env.REDISPASSWORD });
const proxy = require("express-http-proxy");
const corsAnywhere = require("cors-anywhere");
const morgan = require("morgan");

// Creating express server
const app = express();

// Create CORS Anywhere server
const CORS_PROXY_PORT = 5000;
corsAnywhere.createServer({}).listen(CORS_PROXY_PORT, () => console.log(`Internal CORS Anywhere server started at port ${CORS_PROXY_PORT}`));

// Proxy to CORS server
app.use(
  proxy(`localhost:${CORS_PROXY_PORT}`, {
    proxyReqPathResolver: (req) => {
      return req.url.slice(2);
    },
  })
);

const APP_PORT = process.env.PORT;
app.listen(APP_PORT, () => {
  console.log(`External CORS cache server started at port ${APP_PORT}`);
});

// Logging the requests
app.use(morgan("combined"));
cache.on("message", (message) => {
  console.log(message);
});

// s, m, l define cache times
app.get("/s/*", cache.route(10));
app.get("/m/*", cache.route(60));
app.get("/l/*", cache.route(600));
app.options("/s/*", cache.route(10));
app.options("/m/*", cache.route(60));
app.options("/l/*", cache.route(600));
