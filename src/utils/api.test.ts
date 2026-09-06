import { afterEach, describe, expect, it, vi } from "vitest";
import { pokeApi } from "./api";

function mockFetch(ok: boolean, status = 200) {
  const blob = new Blob(["fake-image-bytes"], { type: "image/png" });
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok, status, blob: async () => blob }) as Response)
  );
}

class SuccessReader {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  result: string | null = null;
  readAsDataURL(_blob: Blob) {
    this.result = "data:image/png;base64,ZmFrZS1pbWFnZQ==";
    this.onload?.();
  }
}

class FailureReader {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  result: string | null = null;
  readAsDataURL(_blob: Blob) {
    this.onerror?.();
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("getArtworkBase64", () => {
  it("resolves a data URL on success", async () => {
    mockFetch(true);
    vi.stubGlobal("FileReader", SuccessReader);
    await expect(pokeApi.getArtworkBase64("https://example.com/art.png")).resolves.toBe(
      "data:image/png;base64,ZmFrZS1pbWFnZQ=="
    );
    expect(fetch).toHaveBeenCalledWith("https://example.com/art.png");
  });

  it("rejects on HTTP error so React Query retries apply", async () => {
    mockFetch(false, 404);
    vi.stubGlobal("FileReader", SuccessReader);
    await expect(pokeApi.getArtworkBase64("https://example.com/art.png")).rejects.toThrow(
      "Failed to fetch artwork: 404"
    );
  });

  it("rejects when FileReader fails", async () => {
    mockFetch(true);
    vi.stubGlobal("FileReader", FailureReader);
    await expect(pokeApi.getArtworkBase64("https://example.com/art.png")).rejects.toThrow(
      "Failed to read artwork as data URL"
    );
  });
});
