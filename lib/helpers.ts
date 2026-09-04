import path from "path";
import fs from "fs/promises";

const isInside = (root: string, target: string) => {
  const resolvedRoot = path.resolve(root);
  const resolvedTarget = path.resolve(target);
  const prefix = resolvedRoot.endsWith(path.sep) ? resolvedRoot : resolvedRoot + path.sep;
  return resolvedTarget === resolvedRoot || resolvedTarget.startsWith(prefix);
};

export const safeUrl = async (prefix, url) => {
  const response: { error: boolean; message: string; safeUrl: string } = {
    error: false,
    message: "",
    safeUrl: "",
  };

  if (typeof url !== "string" || url.includes("\0")) {
    response.error = true;
    response.message = "Bad request: null byte detected";
    return response;
  }

  let root: string;
  try {
    root = await fs.realpath(path.resolve(prefix));
  } catch {
    response.error = true;
    response.message = "Resource not found";
    return response;
  }

  const target = path.resolve(root, url);
  if (!isInside(root, target)) {
    response.error = true;
    response.message = "Bad request: traversal detected";
    return response;
  }

  try {
    const realTarget = await fs.realpath(target);
    if (!isInside(root, realTarget)) {
      response.error = true;
      response.message = "Bad request: traversal detected";
      return response;
    }
    response.safeUrl = realTarget;
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "ENOENT") {
      response.safeUrl = target;
    } else {
      response.error = true;
      response.message = err instanceof Error ? err.message : String(err);
    }
  }

  return response;
};
