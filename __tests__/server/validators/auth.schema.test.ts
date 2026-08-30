import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "@/server/validators/auth.schema";

describe("registerSchema", () => {
  const validInput = {
    name: "John Doe",
    email: "john@example.com",
    password: "StrongPass1",
    role: "CLIENT" as const,
  };

  it("accepts valid input", () => {
    const result = registerSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects name shorter than 2 characters", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      name: "J",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("lowercases email", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      email: "JOHN@EXAMPLE.COM",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("john@example.com");
    }
  });

  it("rejects password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      password: "Ab1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without uppercase", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      password: "lowercase1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without lowercase", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      password: "UPPERCASE1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without number", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      password: "NoNumberHere",
    });
    expect(result.success).toBe(false);
  });

  it("defaults role to CLIENT", () => {
    const result = registerSchema.safeParse({
      name: validInput.name,
      email: validInput.email,
      password: validInput.password,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.role).toBe("CLIENT");
    }
  });

  it("accepts COACH role", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      role: "COACH",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.role).toBe("COACH");
    }
  });

  it("rejects ADMIN role", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      role: "ADMIN",
    });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from name", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      name: "  John Doe  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("John Doe");
    }
  });
});

describe("loginSchema", () => {
  it("accepts valid input", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-email",
      password: "password",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("lowercases email", () => {
    const result = loginSchema.safeParse({
      email: "TEST@EXAMPLE.COM",
      password: "password",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("test@example.com");
    }
  });
});
