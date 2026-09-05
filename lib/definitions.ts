import type { BlurImageData } from "./imageProcessing/imageHelpers";

type ImageDetails = {
  height: number | undefined;
  orientation?: number | undefined;
  width: number | undefined;
  type?: string | undefined;
};

export type ImagesObject = {
  fileName: string;
  md5: string | number[];
  details: ImageDetails;
  placeholder: BlurImageData;
};

export interface CustomError extends Error {
  statusCode: number;
}
