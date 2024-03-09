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
const redisClient = await createClient({ url: process.env.REDIS_URL, socket: { timeout: 30000 } })
	.on('error', console.error)
	.connect();
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
if (process.env.ENHANCED_LOGS == 'true') {
	app.use(morgan('combined'));
}

// Create CORS Anywhere server
const CORS_PROXY_PORT = parseInt(process.env.PORT) + 1;
createServer({}).listen(CORS_PROXY_PORT, () => console.log(`Internal CORS Anywhere server started at port ${CORS_PROXY_PORT}`));

// Use cache first
app.use('/cache/:time/*', (req, res, next) => {
	const time = decodeURIComponent(req.params.time);
	req.time = encodeURIComponent(time);
	return cache(time)(req, res, next);
});

// Else proxy to CORS server
app.use(
	proxy(`localhost:${CORS_PROXY_PORT}`, {
		proxyReqPathResolver: (req) => (req.time ? req.url.slice(`/cache/${req.time}`.length) : req.url)
	})
);

const APP_PORT = process.env.PORT;
app.listen(APP_PORT, () => {
	console.log(`External CORS cache server started at port ${APP_PORT}`);
});
