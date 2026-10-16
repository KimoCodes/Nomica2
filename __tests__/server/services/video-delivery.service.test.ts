import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildVideoDeliveryUrl,
  extractCloudinaryPublicId,
} from "@/server/services/video-delivery.service";

const { cloudinaryUrlMock, isConfiguredMock } = vi.hoisted(() => ({
  cloudinaryUrlMock: vi.fn(),
  isConfiguredMock: vi.fn(() => true),
}));

vi.mock("@/lib/cloudinary", () => ({
  isCloudinaryConfigured: isConfiguredMock,
  getCloudinaryClient: () => ({ url: cloudinaryUrlMock }),
}));

const PREV_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const PREV_API_KEY = process.env.CLOUDINARY_API_KEY;
const PREV_API_SECRET = process.env.CLOUDINARY_API_SECRET;

beforeEach(() => {
  vi.clearAllMocks();
  process.env.CLOUDINARY_CLOUD_NAME = "dolnlwllb";
  process.env.CLOUDINARY_API_KEY = "key";
  process.env.CLOUDINARY_API_SECRET = "secret";
});

afterEach(() => {
  process.env.CLOUDINARY_CLOUD_NAME = PREV_CLOUD_NAME;
  process.env.CLOUDINARY_API_KEY = PREV_API_KEY;
  process.env.CLOUDINARY_API_SECRET = PREV_API_SECRET;
});

describe("extractCloudinaryPublicId", () => {
  it("strips host, upload segment, and version", () => {
    expect(
      extractCloudinaryPublicId(
        "https://res.cloudinary.com/dolnlwllb/video/upload/v1788905042/coach-uploads/videos/finalpart_1788905040031.mov",
      ),
    ).toBe("coach-uploads/videos/finalpart_1788905040031");
  });

  it("works without a version segment", () => {
    expect(
      extractCloudinaryPublicId(
        "https://res.cloudinary.com/demo/video/upload/sample.mp4",
      ),
    ).toBe("sample");
  });
});

describe("buildVideoDeliveryUrl", () => {
  it("signs own-cloudinary URLs with an expiry", () => {
    cloudinaryUrlMock.mockReturnValue(
      "https://res.cloudinary.com/dolnlwllb/video/upload/s--signed--/coach-uploads/videos/demo.mp4",
    );

    const result = buildVideoDeliveryUrl(
      "https://res.cloudinary.com/dolnlwllb/video/upload/v1/coach-uploads/videos/demo.mp4",
    );

    expect(result).toContain("signed");
    expect(cloudinaryUrlMock).toHaveBeenCalledWith(
      "coach-uploads/videos/demo",
      expect.objectContaining({
        sign_url: true,
        resource_type: "video",
        expires: expect.any(Number),
      }),
    );
  });

  it("passes external https links through unchanged", () => {
    const youtube =
      "https://www.youtube.com/watch?v=mZQEvRcaFnk";
    expect(buildVideoDeliveryUrl(youtube)).toBe(youtube);
  });

  it("rejects non-http URLs", () => {
    expect(buildVideoDeliveryUrl("javascript:alert(1)")).toBeNull();
  });

  it("treats other clouds as external links", () => {
    const other =
      "https://res.cloudinary.com/other-cloud/video/upload/v1/demo.mp4";
    expect(buildVideoDeliveryUrl(other)).toBe(other);
    expect(cloudinaryUrlMock).not.toHaveBeenCalled();
  });
});
