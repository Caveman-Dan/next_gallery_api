import path from "path";

export const safeUrl = (prefix, url) => {
  const response: { error: boolean; message: string; safeUrl: string } = { error: false, message: "", safeUrl: "" };

  if (url.indexOf("\0") !== -1) {
    response.error = true;
    response.message = "Bad request: null byte detected";
  }
  const safe_input = path.normalize(url).replace(/^(\.\.(\/|\\|$))+/, "");
  const path_string = path.join(prefix, safe_input);
  if (path_string.indexOf(prefix) !== 0) {
    response.error = true;
    response.message = "Bad request: traversal detected";
  }

  response.safeUrl = path_string.replace(/^\/|\/$/g, "");

  return response;
};
