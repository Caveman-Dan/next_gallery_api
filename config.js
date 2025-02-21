import "dotenv/config";

export default {
  port: 8983,
  logging: true,
  httpConfig: {
    index: false,
    acceptedExt: ["jpg", "jpeg", "png"],
    restrictedEndpoints: [process.env.GET_IMAGE_ENDPOINT],
  },
};
