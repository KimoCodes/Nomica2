/**
 * NomiTips Production Database Audit Script
 *
 * This script generates a report of all records in the database, categorized by
 * likely data classification. It does NOT delete anything.
 *
 * Usage:
 *   npx tsx scripts/audit-production-data.ts
 *
 * Environment:
 *   DATABASE_URL must be set (reads from .env automatically via prisma config)
 */

import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// Known seed data identifiers
const SEED_COACH_EMAIL = "coach@nomitips.com";
const SEED_PRODUCT_SLUGS = [
  "glute-builder", "hourglass-sculpt", "toned-legs", "full-body-sculpt",
  "beginner-gym-confidence", "strong-and-toned",
  "cardio-burn-challenge", "core-abs-challenge", "glute-growth-challenge",
  "quad-sculpt-challenge", "stairmaster-challenge",
  "lower-body-bundle", "sculpt-and-sweat-bundle", "complete-nomitips-bundle",
];

// Test indicator patterns (NOT definitive — just flags for review)
const TEST_EMAIL_PATTERNS = [
  /^test/i, /^demo/i, /^fake/i, /^dummy/i,
  /@example\.com$/i, /@test\.com$/i, /@mailinator\.com$/i,
  /@yopmail\.com$/i, /@guerrillamail/i,
];

type Classification = "SYSTEM" | "SEED_CATALOG" | "PRODUCTION" | "LIKELY_TEST" | "UNCERTAIN";

function classifyUser(email: string, role: Role, createdAt: Date): Classification {
  if (email === SEED_COACH_EMAIL) return "SEED_CATALOG";
  if (role === Role.ADMIN) return "PRODUCTION"; // Admin accounts are always production

  const isTestEmail = TEST_EMAIL_PATTERNS.some((p) => p.test(email));
  if (isTestEmail) return "LIKELY_TEST";

  return "UNCERTAIN";
}

function classifyProduct(slug: string): Classification {
  if (SEED_PRODUCT_SLUGS.includes(slug)) return "SEED_CATALOG";
  return "PRODUCTION";
}

async function main() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  console.log("═══════════════════════════════════════════════════════");
  console.log("  NOMITIPS PRODUCTION DATABASE AUDIT");
  console.log("  Generated:", new Date().toISOString());
  console.log("═══════════════════════════════════════════════════════\n");

  // ─── Users ──────────────────────────────────────────────────────────────
  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true, createdAt: true,
      emailVerified: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const userClassifications: Record<Classification, typeof users> = {
    SYSTEM: [], SEED_CATALOG: [], PRODUCTION: [], LIKELY_TEST: [], UNCERTAIN: [],
  };

  for (const user of users) {
    const cls = classifyUser(user.email, user.role, user.createdAt);
    userClassifications[cls].push(user);
  }

  console.log("── USERS ─────────────────────────────────────────────");
  console.log(`Total: ${users.length}`);
  for (const [cls, items] of Object.entries(userClassifications)) {
    if (items.length > 0) {
      console.log(`\n  ${cls}: ${items.length}`);
      for (const u of items) {
        console.log(`    • ${u.email} (${u.role}) — verified: ${!!u.emailVerified} — created: ${u.createdAt.toISOString().split("T")[0]}`);
      }
    }
  }

  // ─── Products ───────────────────────────────────────────────────────────
  const products = await prisma.product.findMany({
    select: { id: true, slug: true, name: true, kind: true, isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const productClassifications: Record<Classification, typeof products> = {
    SYSTEM: [], SEED_CATALOG: [], PRODUCTION: [], LIKELY_TEST: [], UNCERTAIN: [],
  };

  for (const product of products) {
    const cls = classifyProduct(product.slug);
    productClassifications[cls].push(product);
  }

  console.log("\n── PRODUCTS ───────────────────────────────────────────");
  console.log(`Total: ${products.length}`);
  for (const [cls, items] of Object.entries(productClassifications)) {
    if (items.length > 0) {
      console.log(`\n  ${cls}: ${items.length}`);
      for (const p of items) {
        console.log(`    • ${p.slug} (${p.kind}) — active: ${p.isActive}`);
      }
    }
  }

  // ─── Subscriptions ──────────────────────────────────────────────────────
  const subscriptions = await prisma.subscription.findMany({
    select: {
      id: true, userId: true, status: true, plan: true,
      stripeCustomerId: true, createdAt: true,
      user: { select: { email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  console.log("\n── SUBSCRIPTIONS ──────────────────────────────────────");
  console.log(`Total: ${subscriptions.length}`);
  for (const sub of subscriptions) {
    const isManual = sub.stripeCustomerId.startsWith("manual_");
    console.log(`  • ${sub.user.email} — ${sub.plan} — status: ${sub.status} — ${isManual ? "MANUAL/ADMIN" : "STRIPE"} — created: ${sub.createdAt.toISOString().split("T")[0]}`);
  }

  // ─── Purchases ──────────────────────────────────────────────────────────
  const purchases = await prisma.purchase.findMany({
    select: {
      id: true, userId: true, status: true, provider: true, createdAt: true,
      user: { select: { email: true } },
      product: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  console.log("\n── PURCHASES ──────────────────────────────────────────");
  console.log(`Total: ${purchases.length}`);
  for (const p of purchases) {
    console.log(`  • ${p.user.email} — ${p.product.name} (${p.status}) — provider: ${p.provider} — created: ${p.createdAt.toISOString().split("T")[0]}`);
  }

  // ─── Bookings ───────────────────────────────────────────────────────────
  const bookings = await prisma.coachBooking.count();
  console.log("\n── BOOKINGS ───────────────────────────────────────────");
  console.log(`Total: ${bookings}`);

  // ─── Notifications ──────────────────────────────────────────────────────
  const notifications = await prisma.notification.count();
  console.log("\n── NOTIFICATIONS ──────────────────────────────────────");
  console.log(`Total: ${notifications}`);

  // ─── SiteSettings ───────────────────────────────────────────────────────
  const siteSettings = await prisma.siteSettings.findFirst();
  console.log("\n── SITE SETTINGS ──────────────────────────────────────");
  console.log(`Exists: ${!!siteSettings}`);

  // ─── Summary ────────────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  SUMMARY");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`
  Users:
    System/Admin:    ${userClassifications.PRODUCTION.filter((u) => u.role === Role.ADMIN).length}
    Seed Coach:      ${userClassifications.SEED_CATALOG.length}
    Likely Test:     ${userClassifications.LIKELY_TEST.length}
    Uncertain:       ${userClassifications.UNCERTAIN.length}

  Products:
    Seed Catalog:    ${productClassifications.SEED_CATALOG.length}
    Other:           ${productClassifications.PRODUCTION.length}

  Subscriptions:     ${subscriptions.length}
  Purchases:         ${purchases.length}
  Bookings:          ${bookings}
  Notifications:     ${notifications}

  IMPORTANT: This is a READ-ONLY audit. No data has been modified.
  Records marked "UNCERTAIN" require manual review before any cleanup.
  `);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Audit failed:", error);
  process.exit(1);
});
