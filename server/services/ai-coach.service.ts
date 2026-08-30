import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/logger";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export type AiCoachMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type AiCoachContext = {
  userName: string;
  fitnessGoal: string | null;
  activityLevel: string | null;
  recentWorkouts: string;
  recentCheckIn: string;
  streak: number;
};

const SYSTEM_PROMPT = `You are Coach Nomii, an expert fitness coach and nutritionist for NomiTips. You are supportive, knowledgeable, and motivating.

Your personality:
- Encouraging but honest
- Science-based advice
- Focus on progressive overload and consistency
- Understand women's fitness needs
- Practical, actionable advice

You can help with:
- Workout form and technique
- Exercise substitutions
- Nutrition and meal planning
- Recovery and rest
- Motivation and mindset
- Progress analysis
- Program adjustments

Keep responses concise (2-4 sentences max) unless the user asks for detail.
Always prioritize safety. If something seems concerning, recommend consulting a healthcare professional.

Current user context:
{context}`;

function buildContext(ctx: AiCoachContext): string {
  return `
Name: ${ctx.userName}
Goal: ${ctx.fitnessGoal ?? "Not set"}
Level: ${ctx.activityLevel ?? "Not set"}
Current streak: ${ctx.streak} days
Recent workouts: ${ctx.recentWorkouts || "None logged"}
Latest check-in: ${ctx.recentCheckIn || "No check-in yet"}`;
}

export async function getAiCoachResponse(
  userId: string,
  userMessage: string,
  conversationHistory: AiCoachMessage[] = [],
): Promise<string> {
  if (!openai) {
    return getFallbackResponse(userMessage);
  }

  try {
    const client = await prisma.clientProfile.findUnique({
      where: { userId },
      select: {
        fitnessGoal: true,
        activityLevel: true,
        user: { select: { name: true } },
      },
    });

    const completions = await prisma.workoutCompletion.findMany({
      where: { clientProfile: { userId } },
      orderBy: { completedAt: "desc" },
      take: 5,
      include: {
        programDay: { select: { title: true } },
      },
    });

    const checkIn = await prisma.checkIn.findFirst({
      where: { clientProfile: { userId } },
      orderBy: { createdAt: "desc" },
      select: {
        energyLevel: true,
        sleepQuality: true,
        currentWeight: true,
      },
    });

    const streak = await calculateStreak(userId);

    const context: AiCoachContext = {
      userName: client?.user?.name ?? "there",
      fitnessGoal: client?.fitnessGoal ?? null,
      activityLevel: client?.activityLevel ?? null,
      recentWorkouts: completions
        .map((c) => c.programDay?.title ?? "Workout")
        .join(", "),
      recentCheckIn: checkIn
        ? `Energy: ${checkIn.energyLevel}/10, Sleep: ${checkIn.sleepQuality}/10, Weight: ${checkIn.currentWeight ?? "N/A"}`
        : "",
      streak,
    };

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: SYSTEM_PROMPT.replace("{context}", buildContext(context)),
      },
      ...conversationHistory.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: userMessage },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 300,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content ?? "I couldn't generate a response. Please try again.";
  } catch (error) {
    logger.error({ err: error, userId }, "AI Coach error");
    return getFallbackResponse(userMessage);
  }
}

async function calculateStreak(userId: string): Promise<number> {
  const completions = await prisma.workoutCompletion.findMany({
    where: { clientProfile: { userId } },
    orderBy: { completedAt: "desc" },
    select: { completedAt: true },
  });

  if (completions.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < completions.length; i++) {
    const completionDate = new Date(completions[i].completedAt);
    completionDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);

    if (completionDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("form") || lower.includes("technique")) {
    return "For proper form, focus on controlled movements and full range of motion. If you're unsure about a specific exercise, try watching a demo video or asking a spotter to check your form. Safety first!";
  }

  if (lower.includes("substitute") || lower.includes("alternative") || lower.includes("replace")) {
    return "I can help suggest exercise substitutions! Common swaps: squats → lunges, bench press → push-ups, barbell rows → dumbbell rows. What exercise are you looking to replace?";
  }

  if (lower.includes("rest") || lower.includes("recovery") || lower.includes("tired")) {
    return "Rest is crucial for progress! Aim for 7-9 hours of sleep, stay hydrated, and consider active recovery like light walking or stretching on rest days. Your body grows during recovery, not during workouts.";
  }

  if (lower.includes("nutrition") || lower.includes("eat") || lower.includes("diet") || lower.includes("protein")) {
    return "For muscle building, aim for 1.6-2.2g protein per kg of bodyweight daily. Focus on whole foods, stay hydrated, and don't skip meals. Consistency with nutrition is just as important as consistent training.";
  }

  if (lower.includes("motivation") || lower.includes("unmotivated") || lower.includes("give up")) {
    return "Remember why you started! Progress isn't always linear — some days will be harder than others. Focus on showing up consistently, and the results will follow. You've got this!";
  }

  return "I'm here to help with your fitness journey! You can ask me about workout form, exercise substitutions, nutrition advice, recovery tips, or anything else related to your training. What would you like to know?";
}

export async function saveAiConversation(
  userId: string,
  userMessage: string,
  assistantMessage: string,
): Promise<void> {
  try {
    await prisma.aiConversation.create({
      data: {
        userId,
        userMessage,
        assistantMessage,
      },
    });
  } catch (error) {
    logger.error({ err: error, userId }, "Failed to save AI conversation");
  }
}

export async function getAiConversationHistory(
  userId: string,
  limit: number = 20,
): Promise<AiCoachMessage[]> {
  try {
    const messages = await prisma.aiConversation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return messages.reverse().flatMap((m) => [
      { role: "user" as const, content: m.userMessage },
      { role: "assistant" as const, content: m.assistantMessage },
    ]);
  } catch {
    return [];
  }
}
