import { describe, it, expect } from "vitest";
import {
  getPostAuthRedirect,
  getSchemaForStep,
  clientPersonalSchema,
  clientGoalSchema,
  clientExperienceSchema,
  clientEquipmentSchema,
  coachOnboardingSchema,
} from "@/server/validators/onboarding.schema";

describe("getPostAuthRedirect", () => {
  it("redirects admin to /admin", () => {
    expect(getPostAuthRedirect("ADMIN")).toBe("/admin");
  });

  it("redirects coach with completed onboarding to /coach", () => {
    expect(getPostAuthRedirect("COACH", undefined, true)).toBe("/coach");
  });

  it("redirects coach without completed onboarding to /coach/onboarding", () => {
    expect(getPostAuthRedirect("COACH", undefined, false)).toBe("/coach/onboarding");
    expect(getPostAuthRedirect("COACH")).toBe("/coach/onboarding");
  });

  it("redirects client with completed onboarding to /client", () => {
    expect(getPostAuthRedirect("CLIENT", true)).toBe("/client");
  });

  it("redirects client without completed onboarding to /onboarding", () => {
    expect(getPostAuthRedirect("CLIENT", false)).toBe("/onboarding");
    expect(getPostAuthRedirect("CLIENT")).toBe("/onboarding");
  });
});

describe("getSchemaForStep", () => {
  it("returns personal schema for step 1", () => {
    expect(getSchemaForStep(1)).toBe(clientPersonalSchema);
  });

  it("returns goal schema for step 2", () => {
    expect(getSchemaForStep(2)).toBe(clientGoalSchema);
  });

  it("returns experience schema for step 3", () => {
    expect(getSchemaForStep(3)).toBe(clientExperienceSchema);
  });

  it("returns equipment schema for step 4", () => {
    expect(getSchemaForStep(4)).toBe(clientEquipmentSchema);
  });
});

describe("clientPersonalSchema", () => {
  const valid = { age: 25, gender: "MALE", height: 175, weight: 75 };

  it("accepts valid input", () => {
    expect(clientPersonalSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects age below 13", () => {
    expect(clientPersonalSchema.safeParse({ ...valid, age: 12 }).success).toBe(false);
  });

  it("rejects age above 120", () => {
    expect(clientPersonalSchema.safeParse({ ...valid, age: 121 }).success).toBe(false);
  });

  it("rejects height below 100", () => {
    expect(clientPersonalSchema.safeParse({ ...valid, height: 99 }).success).toBe(false);
  });

  it("rejects height above 250", () => {
    expect(clientPersonalSchema.safeParse({ ...valid, height: 251 }).success).toBe(false);
  });

  it("rejects weight below 30", () => {
    expect(clientPersonalSchema.safeParse({ ...valid, weight: 29 }).success).toBe(false);
  });

  it("rejects weight above 300", () => {
    expect(clientPersonalSchema.safeParse({ ...valid, weight: 301 }).success).toBe(false);
  });

  it("coerces string numbers", () => {
    const result = clientPersonalSchema.safeParse({
      age: "25",
      gender: "MALE",
      height: "175",
      weight: "75",
    });
    expect(result.success).toBe(true);
  });
});

describe("clientGoalSchema", () => {
  it("accepts valid FitnessGoal", () => {
    expect(clientGoalSchema.safeParse({ fitnessGoal: "LOSE_FAT" }).success).toBe(true);
  });

  it("rejects invalid goal", () => {
    expect(clientGoalSchema.safeParse({ fitnessGoal: "INVALID" }).success).toBe(false);
  });
});

describe("clientExperienceSchema", () => {
  it("accepts valid ActivityLevel", () => {
    expect(clientExperienceSchema.safeParse({ activityLevel: "BEGINNER" }).success).toBe(true);
  });

  it("rejects invalid level", () => {
    expect(clientExperienceSchema.safeParse({ activityLevel: "EXPERT" }).success).toBe(false);
  });
});

describe("clientEquipmentSchema", () => {
  it("accepts valid Equipment", () => {
    expect(clientEquipmentSchema.safeParse({ equipment: "NONE" }).success).toBe(true);
  });

  it("rejects invalid equipment", () => {
    expect(clientEquipmentSchema.safeParse({ equipment: "Spaceship" }).success).toBe(false);
  });
});

describe("coachOnboardingSchema", () => {
  const valid = {
    bio: "I am a certified fitness coach with 5 years of experience in strength training.",
    specialties: ["Strength Training", "Weight Loss"],
    yearsExperience: 5,
  };

  it("accepts valid input", () => {
    expect(coachOnboardingSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects bio shorter than 20 characters", () => {
    expect(
      coachOnboardingSchema.safeParse({ ...valid, bio: "Short bio" }).success,
    ).toBe(false);
  });

  it("rejects empty specialties array", () => {
    expect(
      coachOnboardingSchema.safeParse({ ...valid, specialties: [] }).success,
    ).toBe(false);
  });

  it("rejects more than 8 specialties", () => {
    expect(
      coachOnboardingSchema.safeParse({
        ...valid,
        specialties: Array(9).fill("Specialty"),
      }).success,
    ).toBe(false);
  });

  it("accepts optional certification", () => {
    expect(
      coachOnboardingSchema.safeParse({
        ...valid,
        certification: "NASM Certified",
      }).success,
    ).toBe(true);
  });

  it("accepts empty certification", () => {
    expect(
      coachOnboardingSchema.safeParse({ ...valid, certification: "" }).success,
    ).toBe(true);
  });

  it("rejects negative years of experience", () => {
    expect(
      coachOnboardingSchema.safeParse({ ...valid, yearsExperience: -1 }).success,
    ).toBe(false);
  });
});
