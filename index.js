require("dotenv").config();
const express = require("express");
const apicache = require("apicache");
const redis = require("redis");
const proxy = require("express-http-proxy");
const corsAnywhere = require("cors-anywhere");
const morgan = require("morgan");

// Creating express server
const app = express();
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDISHOST,
    port: process.env.REDISPORT,
  },
  password: process.env.REDISPASSWORD,
});
let cache = apicache.options({ redisClient: redisClient }).middleware;

// Logging the requests
app.use(morgan("combined"));
redisClient.on("error", (err) => console.log(err));

// Create CORS Anywhere server
const CORS_PROXY_PORT = 5000;
corsAnywhere.createServer({}).listen(CORS_PROXY_PORT, () => console.log(`Internal CORS Anywhere server started at port ${CORS_PROXY_PORT}`));

// Use cache first
// s, m, l define cache times
app.get("/s/*", cache("10 seconds"));
app.get("/m/*", cache("10 minutes"));
app.get("/l/*", cache("1 hour"));
app.options("/s/*", cache("10 seconds"));
app.options("/m/*", cache("10 minutes"));
app.options("/l/*", cache("1 hour"));

// Else proxy to CORS server
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
