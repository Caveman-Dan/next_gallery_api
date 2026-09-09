import assert from "node:assert/strict";
import fs, { mkdtemp, mkdir, writeFile, symlink, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";

import { safeUrl } from "./helpers";

describe("safeUrl", () => {
  let root: string;

  before(async () => {
    root = await fs.realpath(await mkdtemp(path.join(os.tmpdir(), "safeurl-")));
    await mkdir(path.join(root, "album"));
    await writeFile(path.join(root, "album", "pic.jpg"), "x");
  });

  after(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("resolves a file inside the root", async () => {
    const result = await safeUrl(root, "album/pic.jpg");
    assert.equal(result.error, false);
    assert.equal(result.safeUrl, await fs.realpath(path.join(root, "album", "pic.jpg")));
  });

  it("rejects .. traversal", async () => {
    const result = await safeUrl(root, "../outside.jpg");
    assert.equal(result.error, true);
    assert.equal(result.message, "Bad request: traversal detected");
  });

  it("rejects a null byte", async () => {
    const result = await safeUrl(root, "album/pic.jpg\0.png");
    assert.equal(result.error, true);
    assert.equal(result.message, "Bad request: null byte detected");
  });

  it("rejects a non-string path", async () => {
    const result = await safeUrl(root, ["album", "pic.jpg"]);
    assert.equal(result.error, true);
    assert.equal(result.message, "Bad request: null byte detected");
  });

  it("allows a missing file that would still be inside the root", async () => {
    const result = await safeUrl(root, "album/missing.jpg");
    assert.equal(result.error, false);
    assert.equal(result.safeUrl, path.resolve(root, "album/missing.jpg"));
  });

  it("rejects a symlink that escapes the root", async () => {
    const outside = path.join(os.tmpdir(), `safeurl-out-${Date.now()}.jpg`);
    await writeFile(outside, "nope");
    const link = path.join(root, "album", "escape.jpg");
    await symlink(outside, link);

    const result = await safeUrl(root, "album/escape.jpg");
    assert.equal(result.error, true);
    assert.equal(result.message, "Bad request: traversal detected");

    await rm(outside, { force: true });
  });
});
