import { prisma } from "@/lib/prisma";
import { DeviceType, Prisma } from "@prisma/client";

// ─── Tracking ────────────────────────────────────────────────────────

function parseUserAgent(userAgent: string | null | undefined): {
  deviceType: DeviceType;
  browser: string | null;
  os: string | null;
} {
  if (!userAgent) return { deviceType: DeviceType.UNKNOWN, browser: null, os: null };

  const ua = userAgent.toLowerCase();

  let deviceType: DeviceType = DeviceType.DESKTOP;
  if (/mobile|android|iphone|ipod/i.test(ua)) deviceType = DeviceType.MOBILE;
  else if (/tablet|ipad/i.test(ua)) deviceType = DeviceType.TABLET;

  let browser: string | null = null;
  if (/chrome/i.test(ua) && !/edge|opr/i.test(ua)) browser = "Chrome";
  else if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/edge/i.test(ua)) browser = "Edge";
  else if (/opr|opera/i.test(ua)) browser = "Opera";

  let os: string | null = null;
  if (/windows/i.test(ua)) os = "Windows";
  else if (/mac os/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";

  return { deviceType, browser, os };
}

export async function trackPageVisit(data: {
  path: string;
  userId?: string | null;
  sessionId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  referrer?: string | null;
}) {
  const { deviceType, browser, os } = parseUserAgent(data.userAgent);

  return prisma.pageVisit.create({
    data: {
      path: data.path,
      userId: data.userId ?? null,
      sessionId: data.sessionId ?? null,
      ipAddress: data.ipAddress ?? null,
      userAgent: data.userAgent ?? null,
      referrer: data.referrer ?? null,
      deviceType,
      browser,
      os,
    },
  });
}

export async function logActivity(data: {
  userId?: string | null;
  action: string;
  category?: string;
  resourceType?: string;
  resourceId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  success?: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  return prisma.activityLog.create({
    data: {
      userId: data.userId ?? null,
      action: data.action,
      category: data.category ?? null,
      resourceType: data.resourceType ?? null,
      resourceId: data.resourceId ?? null,
      description: data.description ?? null,
      metadata: data.metadata ? (data.metadata as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
      success: data.success ?? true,
      ipAddress: data.ipAddress ?? null,
      userAgent: data.userAgent ?? null,
    },
  });
}

// ─── Analytics Queries ───────────────────────────────────────────────

export type DateRange = {
  from?: Date;
  to?: Date;
};

function defaultDateRange(): DateRange {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return { from, to };
}

export async function getVisitStats(range: DateRange = defaultDateRange()) {
  const where: Prisma.PageVisitWhereInput = {
    createdAt: {
      ...(range.from && { gte: range.from }),
      ...(range.to && { lte: range.to }),
    },
  };

  const [totalVisits, uniqueVisitors, uniqueSessions] = await Promise.all([
    prisma.pageVisit.count({ where }),
    prisma.pageVisit.findMany({
      where: { ...where, userId: { not: null } },
      select: { userId: true },
      distinct: ["userId"],
    }),
    prisma.pageVisit.findMany({
      where: { ...where, sessionId: { not: null } },
      select: { sessionId: true },
      distinct: ["sessionId"],
    }),
  ]);

  return {
    totalVisits,
    uniqueVisitors: uniqueVisitors.length,
    uniqueSessions: uniqueSessions.length,
  };
}

export async function getVisitsByDay(range: DateRange = defaultDateRange()) {
  const where: Prisma.PageVisitWhereInput = {
    createdAt: {
      ...(range.from && { gte: range.from }),
      ...(range.to && { lte: range.to }),
    },
  };

  const visits = await prisma.pageVisit.groupBy({
    by: ["createdAt"],
    where,
    _count: { id: true },
    orderBy: { createdAt: "asc" },
  });

  const grouped: Record<string, number> = {};
  for (const v of visits) {
    const date = v.createdAt.toISOString().split("T")[0];
    grouped[date] = (grouped[date] ?? 0) + v._count.id;
  }

  return Object.entries(grouped).map(([date, count]) => ({ date, count }));
}

export async function getTopPages(limit = 10, range: DateRange = defaultDateRange()) {
  const where: Prisma.PageVisitWhereInput = {
    createdAt: {
      ...(range.from && { gte: range.from }),
      ...(range.to && { lte: range.to }),
    },
  };

  const pages = await prisma.pageVisit.groupBy({
    by: ["path"],
    where,
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  });

  return pages.map((p) => ({ path: p.path, visits: p._count.id }));
}

export async function getDeviceBreakdown(range: DateRange = defaultDateRange()) {
  const where: Prisma.PageVisitWhereInput = {
    createdAt: {
      ...(range.from && { gte: range.from }),
      ...(range.to && { lte: range.to }),
    },
  };

  const devices = await prisma.pageVisit.groupBy({
    by: ["deviceType"],
    where,
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  return devices.map((d) => ({ deviceType: d.deviceType, count: d._count.id }));
}

export async function getBrowserBreakdown(range: DateRange = defaultDateRange()) {
  const where: Prisma.PageVisitWhereInput = {
    createdAt: {
      ...(range.from && { gte: range.from }),
      ...(range.to && { lte: range.to }),
    },
    browser: { not: null },
  };

  const browsers = await prisma.pageVisit.groupBy({
    by: ["browser"],
    where,
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  return browsers.map((b) => ({ browser: b.browser, count: b._count.id }));
}

export async function getOsBreakdown(range: DateRange = defaultDateRange()) {
  const where: Prisma.PageVisitWhereInput = {
    createdAt: {
      ...(range.from && { gte: range.from }),
      ...(range.to && { lte: range.to }),
    },
    os: { not: null },
  };

  const osList = await prisma.pageVisit.groupBy({
    by: ["os"],
    where,
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  return osList.map((o) => ({ os: o.os, count: o._count.id }));
}

export async function getReferrerSources(limit = 10, range: DateRange = defaultDateRange()) {
  const where: Prisma.PageVisitWhereInput = {
    createdAt: {
      ...(range.from && { gte: range.from }),
      ...(range.to && { lte: range.to }),
    },
    referrer: { not: null },
  };

  const referrers = await prisma.pageVisit.groupBy({
    by: ["referrer"],
    where,
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  });

  return referrers.map((r) => ({ referrer: r.referrer, count: r._count.id }));
}

// ─── Activity Queries ────────────────────────────────────────────────

export async function getActivityStats(range: DateRange = defaultDateRange()) {
  const where: Prisma.ActivityLogWhereInput = {
    createdAt: {
      ...(range.from && { gte: range.from }),
      ...(range.to && { lte: range.to }),
    },
  };

  const [totalActions, failedActions, uniqueUsers] = await Promise.all([
    prisma.activityLog.count({ where }),
    prisma.activityLog.count({ where: { ...where, success: false } }),
    prisma.activityLog.findMany({
      where: { ...where, userId: { not: null } },
      select: { userId: true },
      distinct: ["userId"],
    }),
  ]);

  return {
    totalActions,
    failedActions,
    successRate: totalActions > 0 ? ((totalActions - failedActions) / totalActions) * 100 : 100,
    activeUsers: uniqueUsers.length,
  };
}

export async function getActionsByDay(range: DateRange = defaultDateRange()) {
  const where: Prisma.ActivityLogWhereInput = {
    createdAt: {
      ...(range.from && { gte: range.from }),
      ...(range.to && { lte: range.to }),
    },
  };

  const actions = await prisma.activityLog.groupBy({
    by: ["createdAt"],
    where,
    _count: { id: true },
    orderBy: { createdAt: "asc" },
  });

  const grouped: Record<string, number> = {};
  for (const a of actions) {
    const date = a.createdAt.toISOString().split("T")[0];
    grouped[date] = (grouped[date] ?? 0) + a._count.id;
  }

  return Object.entries(grouped).map(([date, count]) => ({ date, count }));
}

export async function getTopActions(limit = 10, range: DateRange = defaultDateRange()) {
  const where: Prisma.ActivityLogWhereInput = {
    createdAt: {
      ...(range.from && { gte: range.from }),
      ...(range.to && { lte: range.to }),
    },
  };

  const actions = await prisma.activityLog.groupBy({
    by: ["action"],
    where,
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  });

  return actions.map((a) => ({ action: a.action, count: a._count.id }));
}

export async function getActionsByCategory(range: DateRange = defaultDateRange()) {
  const where: Prisma.ActivityLogWhereInput = {
    createdAt: {
      ...(range.from && { gte: range.from }),
      ...(range.to && { lte: range.to }),
    },
    category: { not: null },
  };

  const categories = await prisma.activityLog.groupBy({
    by: ["category"],
    where,
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  return categories.map((c) => ({ category: c.category, count: c._count.id }));
}

export async function getRecentActivity(limit = 20, range: DateRange = defaultDateRange()) {
  return prisma.activityLog.findMany({
    where: {
      createdAt: {
        ...(range.from && { gte: range.from }),
        ...(range.to && { lte: range.to }),
      },
    },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getActivityFeed(params: {
  page?: number;
  pageSize?: number;
  userId?: string;
  action?: string;
  category?: string;
  success?: boolean;
  range?: DateRange;
}) {
  const { page = 1, pageSize = 20, userId, action, category, success, range = defaultDateRange() } = params;

  const where: Prisma.ActivityLogWhereInput = {
    createdAt: {
      ...(range.from && { gte: range.from }),
      ...(range.to && { lte: range.to }),
    },
    ...(userId && { userId }),
    ...(action && { action }),
    ...(category && { category }),
    ...(success !== undefined && { success }),
  };

  const [total, activities] = await Promise.all([
    prisma.activityLog.count({ where }),
    prisma.activityLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    activities,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// ─── Combined Dashboard ──────────────────────────────────────────────

export async function getAnalyticsDashboard(range: DateRange = defaultDateRange()) {
  const [visits, activities, topPages, topActions, deviceBreakdown, browserBreakdown, actionsByDay, visitsByDay, recentActivity, categoryBreakdown] = await Promise.all([
    getVisitStats(range),
    getActivityStats(range),
    getTopPages(5, range),
    getTopActions(5, range),
    getDeviceBreakdown(range),
    getBrowserBreakdown(range),
    getActionsByDay(range),
    getVisitsByDay(range),
    getRecentActivity(10, range),
    getActionsByCategory(range),
  ]);

  return {
    visits,
    activities,
    topPages,
    topActions,
    deviceBreakdown,
    browserBreakdown,
    actionsByDay,
    visitsByDay,
    recentActivity,
    categoryBreakdown,
  };
}
