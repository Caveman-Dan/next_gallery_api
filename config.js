import "dotenv/config";

export default {
  port: 8983, // Listening port
  logging: {
    active: true, // enable/disable logging
    excludedRoutes: ["/status"], // exclude on these routes
  },
  httpConfig: {
    // express.static config
    index: false, // Do not serve index.html
    maxAge: "1d", // How long browsers / proxies may reuse the file without asking again
    etag: true, // 304 Not Modified when the file bytes have not changed (If-None-Match)
    lastMadified: true, // 304 when the file's mtime has not changed (If-Modified-Since)
    acceptedExt: ["jpg", "jpeg", "png"], // Allow-list for get_image (acceptedExtensions middleware). Not a serve-static option
    restrictedEndpoints: [process.env.GET_IMAGE_ENDPOINT], // Paths that must go through that allow-list. Not a serve-static option.
  },
  cache: {
    folder: "image_cache", // name of folder used for image caching
    cacheVersion: 1, // bump version & restart server to refresh image cache
  },
  transform: {
    maxWidth: 2560, // Reject / clamp ?w= above this so nobody asks for w=99999.
    jpegQuality: 80,
  },
};
