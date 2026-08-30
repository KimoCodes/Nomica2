import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { requireAuth } from "@/lib/auth";
import {
  getNutritionDashboard,
  searchLocalFoods,
  getFoodDetails,
  getSubstitutes,
  getPortionSuggestion,
  calculateSwapPortion,
  getMacroTargets,
  logMealEntry,
  getTodayMeals,
} from "@/server/services/nutrition.service";
import { traceApiRoute } from "@/lib/sentry-tracing";
import logger from "@/lib/logger";

const logMealSchema = z.object({
  foodId: z.string().min(1),
  portionGrams: z.number().positive(),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK", "OTHER"]),
  notes: z.string().optional(),
});

export async function GET(request: Request) {
  return traceApiRoute("GET /api/client/nutrition", async () => {
    try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "search") {
      const query = searchParams.get("q") ?? "";
      const foods = searchLocalFoods(query);
      return NextResponse.json({ foods });
    }

    if (action === "food") {
      const foodId = searchParams.get("id");
      if (!foodId) {
        return NextResponse.json({ error: "Missing food id" }, { status: 400 });
      }
      const food = getFoodDetails(foodId);
      if (!food) {
        return NextResponse.json({ error: "Food not found" }, { status: 404 });
      }
      return NextResponse.json({ food });
    }

    if (action === "substitutes") {
      const foodId = searchParams.get("id");
      if (!foodId) {
        return NextResponse.json({ error: "Missing food id" }, { status: 400 });
      }
      const substitutes = getSubstitutes(foodId);
      return NextResponse.json({ substitutes });
    }

    if (action === "portion") {
      const foodId = searchParams.get("id");
      const calories = parseInt(searchParams.get("calories") ?? "0", 10);
      if (!foodId || !calories) {
        return NextResponse.json({ error: "Missing food id or calories" }, { status: 400 });
      }
      const suggestion = getPortionSuggestion(foodId, calories);
      return NextResponse.json({ suggestion });
    }

    if (action === "swap") {
      const originalId = searchParams.get("original");
      const substituteId = searchParams.get("substitute");
      const grams = parseInt(searchParams.get("grams") ?? "0", 10);
      if (!originalId || !substituteId || !grams) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
      }
      const swap = calculateSwapPortion(originalId, substituteId, grams);
      return NextResponse.json({ swap });
    }

    if (action === "macros") {
      const goal = searchParams.get("goal") ?? "general_fitness";
      const targets = getMacroTargets(goal);
      return NextResponse.json({ targets });
    }

    if (action === "today") {
      const data = await getTodayMeals(session.user.id);
      return NextResponse.json(data);
    }

    const dashboard = await getNutritionDashboard(session.user.id);
    return NextResponse.json(dashboard);
  } catch (error) {
    logger.error({ err: error, route: "client/nutrition" }, "GET /api/client/nutrition error");

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
  });
}

export async function POST(request: Request) {
  return traceApiRoute("POST /api/client/nutrition", async () => {
    try {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = logMealSchema.parse(body);

    const meal = await logMealEntry(session.user.id, parsed);
    return NextResponse.json({ meal }, { status: 201 });
  } catch (error) {
    logger.error({ err: error, route: "client/nutrition" }, "POST /api/client/nutrition error");

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.flatten() },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error instanceof Error && error.message === "INVALID_FOOD") {
      return NextResponse.json({ error: "Invalid food ID" }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
  });
}
