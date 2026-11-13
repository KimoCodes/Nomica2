import { describe, expect, it } from "vitest";
import { isSiteAccessAllowed } from "@/lib/site-access";

describe("isSiteAccessAllowed", () => {
  it.each(["COMING_SOON", "MAINTENANCE"])(
    "allows an authenticated admin through %s mode without an approved IP",
    (websiteAccessMode) => {
      expect(
        isSiteAccessAllowed(
          "/admin/access",
          "203.0.113.10",
          {
            websiteAccessMode,
            approvedIpAddresses: [],
          },
          "ADMIN",
        ),
      ).toBe(true);
    },
  );

  it.each(["COMING_SOON", "MAINTENANCE"])(
    "allows the authorized coach through %s mode without an approved IP",
    (websiteAccessMode) => {
      expect(
        isSiteAccessAllowed(
          "/coach",
          "203.0.113.10",
          {
            websiteAccessMode,
            approvedIpAddresses: [],
          },
          "COACH",
          "NomiTipsCoaching@gmail.com",
        ),
      ).toBe(true);
    },
  );

  it.each(["COMING_SOON", "MAINTENANCE"])(
    "blocks other coaches from %s mode",
    (websiteAccessMode) => {
      expect(
        isSiteAccessAllowed(
          "/coach",
          "203.0.113.10",
          {
            websiteAccessMode,
            approvedIpAddresses: [],
          },
          "COACH",
          "another-coach@example.com",
        ),
      ).toBe(false);
    },
  );

  it.each(["COMING_SOON", "MAINTENANCE"])(
    "continues to block non-staff users from protected pages in %s mode",
    (websiteAccessMode) => {
      expect(
        isSiteAccessAllowed(
          "/client",
          "203.0.113.10",
          {
            websiteAccessMode,
            approvedIpAddresses: [],
          },
          "CLIENT",
        ),
      ).toBe(false);
    },
  );

  it("keeps non-staff visitors out in normal mode with IP restrictions", () => {
    expect(
      isSiteAccessAllowed(
        "/",
        "203.0.113.10",
        {
          websiteAccessMode: "NORMAL",
          publicAccessRestrictionEnabled: true,
          approvedIpAddresses: [{ value: "198.51.100.10" }],
        },
        "CLIENT",
      ),
    ).toBe(false);
  });

  it("never locks an admin out of normal mode with IP restrictions", () => {
    expect(
      isSiteAccessAllowed(
        "/admin/access",
        "203.0.113.10",
        {
          websiteAccessMode: "NORMAL",
          publicAccessRestrictionEnabled: true,
          approvedIpAddresses: [{ value: "198.51.100.10" }],
        },
        "ADMIN",
      ),
    ).toBe(true);
  });

  it("lets an approved IP through in normal mode with IP restrictions", () => {
    expect(
      isSiteAccessAllowed(
        "/",
        "198.51.100.10",
        {
          websiteAccessMode: "NORMAL",
          publicAccessRestrictionEnabled: true,
          approvedIpAddresses: [{ value: "198.51.100.10" }],
        },
        null,
      ),
    ).toBe(true);
  });

  it.each([
    {
      mode: "COMING_SOON",
      config: {
        websiteAccessMode: "COMING_SOON",
        comingSoonAutoSwitch: true,
        comingSoonLaunchAt: "2026-01-01T00:00:00.000Z",
      },
    },
    {
      mode: "MAINTENANCE",
      config: {
        websiteAccessMode: "MAINTENANCE",
        maintenanceReturnAt: "2026-01-01T00:00:00.000Z",
      },
    },
  ])(
    "auto-opens the site once the $mode schedule has elapsed",
    ({ config }) => {
      expect(
        isSiteAccessAllowed(
          "/pricing",
          "203.0.113.10",
          config,
          null,
          undefined,
          new Date("2026-06-01T00:00:00.000Z"),
        ),
      ).toBe(true);
    },
  );

  it("stays closed before the scheduled launch time", () => {
    expect(
      isSiteAccessAllowed(
        "/pricing",
        "203.0.113.10",
        {
          websiteAccessMode: "COMING_SOON",
          comingSoonAutoSwitch: true,
          comingSoonLaunchAt: "2026-12-31T00:00:00.000Z",
        },
        null,
        undefined,
        new Date("2026-06-01T00:00:00.000Z"),
      ),
    ).toBe(false);
  });

  it("does not auto-open coming soon mode when auto-switch is off", () => {
    expect(
      isSiteAccessAllowed(
        "/pricing",
        "203.0.113.10",
        {
          websiteAccessMode: "COMING_SOON",
          comingSoonAutoSwitch: false,
          comingSoonLaunchAt: "2026-01-01T00:00:00.000Z",
        },
        null,
        undefined,
        new Date("2026-06-01T00:00:00.000Z"),
      ),
    ).toBe(false);
  });
});
