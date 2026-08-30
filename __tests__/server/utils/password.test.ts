import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/server/utils/password";

describe("hashPassword", () => {
  it("returns a hash string", async () => {
    const hash = await hashPassword("TestPassword123");
    expect(typeof hash).toBe("string");
    expect(hash.length).toBeGreaterThan(0);
  });

  it("produces different hashes for same input (salt)", async () => {
    const hash1 = await hashPassword("TestPassword123");
    const hash2 = await hashPassword("TestPassword123");
    expect(hash1).not.toBe(hash2);
  });
});

describe("verifyPassword", () => {
  it("returns true for matching password", async () => {
    const hash = await hashPassword("MySecurePass1");
    const result = await verifyPassword("MySecurePass1", hash);
    expect(result).toBe(true);
  });

  it("returns false for non-matching password", async () => {
    const hash = await hashPassword("MySecurePass1");
    const result = await verifyPassword("WrongPassword1", hash);
    expect(result).toBe(false);
  });
});
