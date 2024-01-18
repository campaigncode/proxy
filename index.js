import 'dotenv/config';
import express from 'express';
import apicache from 'apicache';
import { createClient } from 'redis';
import proxy from 'express-http-proxy';
import { createServer } from 'cors-anywhere';
import morgan from 'morgan';

// Creating express server
const app = express();

// Creating redis client and wrapper (proxy uses some old methods)
const redisClient = await createClient({ url: process.env.REDIS_URL }).on('error', console.error).connect();
const redisWrapper = {
	...redisClient,
	connected: redisClient.isOpen,
	del: (keys) => redisClient.del(keys),
	hgetall: (key, fn) =>
		redisClient
			.hGetAll(key)
			.then((resp) => fn(null, resp))
			.catch(fn),
	hset: (key, field, value) => redisClient.hSet(key, field, value),
	expire: (key, seconds) => redisClient.expire(key, seconds)
};

// Instantiate cache
const cache = apicache.options({ redisClient: redisWrapper }).middleware;

// Logging the requests
app.use(morgan('combined'));

// Create CORS Anywhere server
const CORS_PROXY_PORT = process.env.INTERNAL_PORT;
createServer({}).listen(CORS_PROXY_PORT, () => console.log(`Internal CORS Anywhere server started at port ${CORS_PROXY_PORT}`));

// Use cache first
// s, m, l, u define cache times
app.use('/s/*', cache('10 seconds'));
app.use('/m/*', cache('10 minutes'));
app.use('/l/*', cache('1 hour'));
app.use('/u/*', cache('12 months'));

// Else proxy to CORS server
app.use(
	proxy(`localhost:${CORS_PROXY_PORT}`, {
		proxyReqPathResolver: (req) => req.url.slice(2)
	})
);

const APP_PORT = process.env.PORT;
app.listen(APP_PORT, () => {
	console.log(`External CORS cache server started at port ${APP_PORT}`);
});
