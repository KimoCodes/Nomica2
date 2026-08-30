import { describe, it, expect } from "vitest";
import {
  createApiResponse,
  createSuccessResponse,
  createErrorResponse,
} from "@/server/utils/response";

describe("createApiResponse", () => {
  it("creates success response with data", () => {
    const result = createApiResponse(true, { id: 1 });
    expect(result).toEqual({
      success: true,
      data: { id: 1 },
      error: undefined,
    });
  });

  it("creates error response", () => {
    const result = createApiResponse(false, undefined, {
      message: "Not found",
      code: "NOT_FOUND",
    });
    expect(result).toEqual({
      success: false,
      data: undefined,
      error: { message: "Not found", code: "NOT_FOUND" },
    });
  });

  it("creates response without optional fields", () => {
    const result = createApiResponse(true);
    expect(result).toEqual({
      success: true,
      data: undefined,
      error: undefined,
    });
  });
});

describe("createSuccessResponse", () => {
  it("wraps data in success envelope", () => {
    const result = createSuccessResponse({ name: "test" });
    expect(result).toEqual({
      success: true,
      data: { name: "test" },
      error: undefined,
    });
  });
});

describe("createErrorResponse", () => {
  it("creates error with message only", () => {
    const result = createErrorResponse("Something failed");
    expect(result).toEqual({
      success: false,
      data: undefined,
      error: { message: "Something failed", code: undefined },
    });
  });

  it("creates error with message and code", () => {
    const result = createErrorResponse("Unauthorized", "UNAUTHORIZED");
    expect(result).toEqual({
      success: false,
      data: undefined,
      error: { message: "Unauthorized", code: "UNAUTHORIZED" },
    });
  });
});
