import "dotenv/config";

export default {
  port: 8983, // Listening port
  cors: {
    origin: [process.env.CORS_ORIGIN].filter(Boolean), // .filter() prevents undefined
  },
  logging: {
    active: true, // enable/disable logging
    excludedRoutes: ["/status"], // exclude on these routes
  },
  httpConfig: {
    // express.static config
    index: false, // Do not serve index.html
    maxAge: "1d", // How long browsers / proxies may reuse the file without asking again
    etag: true, // 304 Not Modified when the file bytes have not changed (If-None-Match)
    lastModified: true, // 304 when the file's mtime has not changed (If-Modified-Since)
    acceptedExt: ["jpg", "jpeg", "png"], // Allow-list for get_image (acceptedExtensions middleware). Not a serve-static option
    restrictedEndpoints: [process.env.GET_IMAGE_ENDPOINT], // Paths that must go through that allow-list. Not a serve-static option.
  },
  cache: {
    folder: "image_cache", // name of folder used for image caching
    cacheVersion: 2, // bump version & restart server to refresh image cache
  },
  transform: {
    allowedWidths: [600, 1600], // prevent DOS by restricting vales, once cached the request is cheap
    jpegQuality: 80,
  },
  rateLimit: {
    windowMs: 60_000, // How long to remember requests for, in milliseconds.
    trustProxy: false, // When Node sits behind a reverse proxy, use the client IP (not the proxy) for rate limits.
    api: 300, // all /api
    getImages: 60, // Sharp metadata + blur
    transform: 120, // ?w= only; skip plain originals
  },
};
