const express = require("express");
const apicache = require("apicache");
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

const FALLBACK_PORT = 8080;
const APP_PORT = process.env.PORT || FALLBACK_PORT;
app.listen(APP_PORT, () => {
  console.log(`External CORS cache server started at port ${APP_PORT}`);
});

// Logging the requests
app.use(morgan("combined"));

app.get("/*", cacheMiddleware());
app.options("/*", cacheMiddleware());

// Caching function
function cacheMiddleware() {
  const cacheOptions = {
    statusCodes: { include: [200] },
    defaultDuration: 60000,
    appendKey: (req, res) => req.method,
  };
  let cacheMiddleware = apicache.options(cacheOptions).middleware();
  return cacheMiddleware;
}
