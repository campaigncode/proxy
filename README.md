# Caching CORS Proxy

A caching cors proxy for all APIs. To use the cache, use the `/cache/{time}` endpoint. Time must represent a URL encoded duration:

-   `1%20minute` => 1 minute
-   `10%20hours` => 10 hours

To avoid using the cache, simply use `/{YOUR URL}`.

To bypass cache on a specific request, set `"x-apicache-bypass": true` in the request header.
