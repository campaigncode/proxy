# Caching CORS Proxy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/VFbUtB?referralCode=eM55xc)

A caching cors proxy for all APIs. To use the cache, use the `/cache/{time}` endpoint. Time must represent a valid duration.

-   `1 minute`
-   `2 hours`

Allowed durations are:

-   ms
-   second(s)
-   minute(s)
-   hour(s)
-   day(s)
-   week(s)
-   month(s)

To avoid using the cache, simply use `/{YOUR URL}`. To bypass cache on a specific request, set `"x-apicache-bypass": true` in the request header.

ALL requests will be routed through the CORS server, regardless of whether they are cached or not.

To enable detailed logs of requests in the console, set the `EHNANCED_LOGS` environment variable to `true`.

### Examples

-   `https://CACHE PROXY URL/cache/10 minutes/https://URL TO BE CACHED/` will be cached for 10 minutes.
-   `https://CACHE PROXY URL/cache/1 hour/https://URL TO BE CACHED/` will be cached for 1 hour.
-   `https://CACHE PROXY URL/https://URL TO BE CACHED/` will not be cached.
