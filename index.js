const express = require("express");
const cache = require("express-redis-cache")({ prefix: "proxy", expire: 10, host: process.env.REDISHOST, port: process.env.REDISPORT, auth_pass: process.env.REDISPASSWORD });
const expressHttpProxy = require("express-http-proxy");
const corsAnywhere = require("cors-anywhere");
const morgan = require("morgan");
require("dotenv").config();

// Creating express server
const app = express();

// Create CORS Anywhere server
const CORS_PROXY_PORT = 5000;
corsAnywhere.createServer({}).listen(CORS_PROXY_PORT, () => console.log(`Internal CORS Anywhere server started at port ${CORS_PROXY_PORT}`));

// Proxy to CORS server
app.use(expressHttpProxy(`localhost:${CORS_PROXY_PORT}`));

const APP_PORT = process.env.PORT;
app.listen(APP_PORT, () => {
  console.log(`External CORS cache server started at port ${APP_PORT}`);
});

// Logging the requests
app.use(morgan("combined"));

app.get("/*", cache.route());
app.options("/*", cache.route());
