require("dotenv").config();
const express = require("express");
const apicache = require("apicache");
const redis = require("redis");
const proxy = require("express-http-proxy");
const corsAnywhere = require("cors-anywhere");
const morgan = require("morgan");

// Creating express server
const app = express();
const redisClient = redis.createClient(process.env.REDIS_URL);
let cache = apicache.options({ redisClient: redisClient }).middleware;

// Logging the requests
app.use(morgan("combined"));
redisClient.on("error", (err) => console.log(err));

// Create CORS Anywhere server
const CORS_PROXY_PORT = 5000;
corsAnywhere.createServer({}).listen(CORS_PROXY_PORT, () => console.log(`Internal CORS Anywhere server started at port ${CORS_PROXY_PORT}`));

// Use cache first
// s, m, l, u define cache times
app.use("/s/*", cache("10 seconds"));
app.use("/m/*", cache("10 minutes"));
app.use("/l/*", cache("1 hour"));
app.use("/u/*", cache("12 months"));

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
