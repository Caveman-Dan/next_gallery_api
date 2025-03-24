import type { BlurImageData } from "./imageProcessing";

type ImageDetails = {
  height: number | undefined;
  orientation?: number | undefined;
  width: number | undefined;
  type?: string | undefined;
};

export type ImagesObject = {
  fileName: string;
  details: ImageDetails;
  placeholder: BlurImageData;
};
