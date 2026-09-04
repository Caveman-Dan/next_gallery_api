import sharp from "sharp";
import fs from "fs/promises";

export type BlurImageData = {
  error: boolean;
  blurData: string;
};

export const getImageDetails = async (filePath: string) => {
  const { width, height, orientation, format } = await sharp(filePath).metadata();
  return { width, height, orientation, type: format };
};

export const getBlurImageData = async (filePath: string): Promise<BlurImageData> => {
  try {
    const imageBuffer = await fs.readFile(filePath);
    const resizedBuffer = await sharp(imageBuffer).resize(20).toBuffer();
    return { error: false, blurData: `data:image/png;base64,${resizedBuffer.toString("base64")}` };
  } catch {
    return {
      error: true,
      blurData:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOsa2yqBwAFCAICLICSyQAAAABJRU5ErkJggg==",
    };
  }
};
