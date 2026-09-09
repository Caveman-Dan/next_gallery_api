import "dotenv/config";

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be set in .env`);
  }
  return value;
};

const port = Number(requireEnv("PORT"));
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer 1–65535");
}

const getImageEndpoint = requireEnv("GET_IMAGE_ENDPOINT");
const corsOrigin = requireEnv("CORS_ORIGIN");

requireEnv("IMAGES_FOLDER");
requireEnv("API_EXTENSION");
requireEnv("GET_IMAGES_ENDPOINT");
requireEnv("GET_ALBUMS_ENDPOINT");
requireEnv("GET_STATUS_ENDPOINT");

export default {
  port, // Listening port
  cors: {
    origin: [corsOrigin],
  },
  logging: {
    active: process.env.LOGGING === "true", // enable/disable logging
    excludedRoutes: ["/status"], // exclude on these routes
  },
  httpConfig: {
    // express.static config
    index: false, // Do not serve index.html
    maxAge: "1d", // How long browsers / proxies may reuse the file without asking again
    etag: true, // 304 Not Modified when the file bytes have not changed (If-None-Match)
    lastModified: true, // 304 when the file's mtime has not changed (If-Modified-Since)
    acceptedExt: ["jpg", "jpeg", "png"], // Allow-list for get_image (acceptedExtensions middleware). Not a serve-static option
    restrictedEndpoints: [getImageEndpoint], // Paths that must go through that allow-list. Not a serve-static option.
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
    trustProxy: process.env.RATE_LIMIT_TRUST_PROXY === "true", // When Node sits behind a reverse proxy, use the client IP (not the proxy) for rate limits.
    api: 300, // all /api
    getImages: 60, // Sharp metadata + blur
    transform: 120, // ?w= only; skip plain originals
  },
};
