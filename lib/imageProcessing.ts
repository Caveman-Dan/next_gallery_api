import sharp from "sharp";
import fs from "fs/promises";

export const getBlurImageData = async (filePath: string) => {
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
