import { describe, it, expect } from "vitest";
import {
  formatPrice,
  formatPlanPrice,
  ACTIVE_STATUSES,
  PLANS,
  PLAN_BY_ID,
} from "@/constants/subscriptions";

describe("ACTIVE_STATUSES", () => {
  it("includes active, trialing, and past_due", () => {
    expect(ACTIVE_STATUSES).toContain("active");
    expect(ACTIVE_STATUSES).toContain("trialing");
    expect(ACTIVE_STATUSES).toContain("past_due");
    expect(ACTIVE_STATUSES).toHaveLength(3);
  });
});

describe("PLANS", () => {
  it("has exactly two plans", () => {
    expect(PLANS).toHaveLength(2);
  });

  it("monthly plan has correct price", () => {
    const monthly = PLANS.find((p) => p.id === "ALL_ACCESS_MONTHLY");
    expect(monthly).toBeDefined();
    expect(monthly!.priceCents).toBe(1499);
    expect(monthly!.interval).toBe("month");
  });

  it("annual plan has correct price", () => {
    const annual = PLANS.find((p) => p.id === "ALL_ACCESS_ANNUAL");
    expect(annual).toBeDefined();
    expect(annual!.priceCents).toBe(14999);
    expect(annual!.interval).toBe("year");
  });
});

describe("PLAN_BY_ID", () => {
  it("maps monthly plan by ID", () => {
    expect(PLAN_BY_ID["ALL_ACCESS_MONTHLY"]).toBeDefined();
    expect(PLAN_BY_ID["ALL_ACCESS_MONTHLY"].priceCents).toBe(1499);
  });

  it("maps annual plan by ID", () => {
    expect(PLAN_BY_ID["ALL_ACCESS_ANNUAL"]).toBeDefined();
    expect(PLAN_BY_ID["ALL_ACCESS_ANNUAL"].priceCents).toBe(14999);
  });
});

describe("formatPrice", () => {
  it("formats cents as USD currency", () => {
    expect(formatPrice(1499)).toBe("$14.99");
    expect(formatPrice(14999)).toBe("$149.99");
  });

  it("formats round dollar amounts without decimals", () => {
    expect(formatPrice(1000)).toBe("$10");
    expect(formatPrice(500)).toBe("$5");
  });

  it("formats zero", () => {
    expect(formatPrice(0)).toBe("$0");
  });
});

describe("formatPlanPrice", () => {
  it("formats monthly plan price", () => {
    const monthly = PLANS.find((p) => p.id === "ALL_ACCESS_MONTHLY")!;
    expect(formatPlanPrice(monthly)).toBe("$14.99 / month");
  });

  it("formats annual plan price", () => {
    const annual = PLANS.find((p) => p.id === "ALL_ACCESS_ANNUAL")!;
    expect(formatPlanPrice(annual)).toBe("$149.99 / year");
  });
});
