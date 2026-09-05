import "dotenv/config";

export default {
  port: 8983,
  logging: {
    active: true,
    excludedRoutes: ["/status"],
  },
  httpConfig: {
    index: false,
    acceptedExt: ["jpg", "jpeg", "png"],
    restrictedEndpoints: [process.env.GET_IMAGE_ENDPOINT],
  },
  cache: {
    folder: "image_cache",
    cacheVersion: 1, // bump version & restart server to refresh image cache
  },
};
