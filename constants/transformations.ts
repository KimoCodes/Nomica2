export type Transformation = {
  id: string;
  name: string;
  age: number;
  location: string;
  duration: string;
  program: string;
  beforeWeight: number;
  afterWeight: number;
  gluteIncrease: number;
  quote: string;
  story: string;
  tips: string[];
  stats: { label: string; value: string }[];
  featured: boolean;
};

export const TRANSFORMATIONS: Transformation[] = [
  {
    id: "sarah-k",
    name: "Sarah K.",
    age: 28,
    location: "Atlanta, GA",
    duration: "12 weeks",
    program: "12-Week Glute Sculpt",
    beforeWeight: 145,
    afterWeight: 138,
    gluteIncrease: 3,
    quote:
      "I went from hiding my body in baggy clothes to wearing shorts自信fully every day.",
    story:
      "Sarah had always been self-conscious about her flat backside. Despite years of gym sessions, she couldn't figure out how to grow her glutes. After joining the Glute Sculpt program, she learned proper activation techniques and progressive overload. By week 8, her clothes were fitting differently. By week 12, she had gained 3 inches on her glutes while losing 7 pounds overall.",
    tips: [
      "Focus on glute activation before every workout",
      "Don't skip the warm-up — it makes a huge difference",
      "Progressive overload is key — increase weight each week",
    ],
    stats: [
      { label: "Duration", value: "12 weeks" },
      { label: "Workouts Completed", value: "36" },
      { label: "Glute Growth", value: "+3 inches" },
      { label: "Weight Change", value: "-7 lbs" },
    ],
    featured: true,
  },
  {
    id: "jasmine-m",
    name: "Jasmine M.",
    age: 32,
    location: "Chicago, IL",
    duration: "8 weeks",
    program: "Beginner Bundle",
    beforeWeight: 165,
    afterWeight: 155,
    gluteIncrease: 2,
    quote:
      "As a complete beginner, I was terrified of the gym. This program gave me the confidence to walk in and own it.",
    story:
      "Jasmine had never stepped foot in a gym before. She was intimidated by the equipment and didn't know where to start. The Beginner Bundle broke everything down into simple, manageable steps. She learned proper form, built confidence, and discovered a love for strength training. Now she's training 4 days a week and planning to compete in a bodybuilding show.",
    tips: [
      "Start slow — don't try to do too much too fast",
      "Take progress photos weekly — the scale doesn't tell the whole story",
      "Find a workout buddy for accountability",
    ],
    stats: [
      { label: "Duration", value: "8 weeks" },
      { label: "Workouts Completed", value: "24" },
      { label: "Glute Growth", value: "+2 inches" },
      { label: "Weight Change", value: "-10 lbs" },
    ],
    featured: true,
  },
  {
    id: "michelle-r",
    name: "Michelle R.",
    age: 25,
    location: "Los Angeles, CA",
    duration: "16 weeks",
    program: "Glute Bundle",
    beforeWeight: 130,
    afterWeight: 128,
    gluteIncrease: 4,
    quote:
      "The Stairmaster program alone was worth it. My glutes have never looked this good.",
    story:
      "Michelle was already active but hit a plateau with her glute growth. She tried the Glute Bundle for a fresh approach. The combination of the 12-Week Glute Sculpt and Stairmaster Program gave her the variety and progressive overload she needed. Her glutes grew 4 inches while her overall body composition improved dramatically.",
    tips: [
      "Heart rate zone training changes everything",
      "Don't neglect nutrition — it's 80% of the battle",
      "Take rest days seriously — recovery is when you grow",
    ],
    stats: [
      { label: "Duration", value: "16 weeks" },
      { label: "Workouts Completed", value: "64" },
      { label: "Glute Growth", value: "+4 inches" },
      { label: "Weight Change", value: "-2 lbs" },
    ],
    featured: true,
  },
  {
    id: "ashley-t",
    name: "Ashley T.",
    age: 35,
    location: "Houston, TX",
    duration: "6 weeks",
    program: "14-Day Booty Challenge",
    beforeWeight: 155,
    afterWeight: 150,
    gluteIncrease: 1.5,
    quote:
      "I didn't think a 2-week challenge could make such a difference. My husband noticed before I did!",
    story:
      "Ashley was skeptical about the 14-Day Booty Challenge. How much could really change in 2 weeks? But after completing it, she was hooked. The targeted exercises woke up muscles she didn't even know she had. She immediately signed up for the Glute Sculpt program to continue her progress.",
    tips: [
      "Consistency beats perfection — just show up",
      "Track your measurements, not just weight",
      "Celebrate small wins along the way",
    ],
    stats: [
      { label: "Duration", value: "6 weeks" },
      { label: "Workouts Completed", value: "14" },
      { label: "Glute Growth", value: "+1.5 inches" },
      { label: "Weight Change", value: "-5 lbs" },
    ],
    featured: false,
  },
  {
    id: "diana-l",
    name: "Diana L.",
    age: 29,
    location: "Miami, FL",
    duration: "12 weeks",
    program: "12-Week Glute Sculpt",
    beforeWeight: 140,
    afterWeight: 135,
    gluteIncrease: 3.5,
    quote:
      "The progressive overload system actually works. I'm deadlifting 200lbs now!",
    story:
      "Diana had been training for years but never saw significant glute growth. The Glute Sculpt program taught her the importance of progressive overload and proper programming. She went from struggling with hip thrusts to deadlifting 200lbs and her glutes grew 3.5 inches in the process.",
    tips: [
      "Progressive overload is non-negotiable for growth",
      "Form first, weight second — always",
      "Track your lifts — you can't improve what you don't measure",
    ],
    stats: [
      { label: "Duration", value: "12 weeks" },
      { label: "Workouts Completed", value: "36" },
      { label: "Glute Growth", value: "+3.5 inches" },
      { label: "Weight Change", value: "-5 lbs" },
    ],
    featured: false,
  },
  {
    id: "karen-w",
    name: "Karen W.",
    age: 42,
    location: "New York, NY",
    duration: "20 weeks",
    program: "Ultimate Transformation Bundle",
    beforeWeight: 175,
    afterWeight: 158,
    gluteIncrease: 4.5,
    quote:
      "At 42, I'm in the best shape of my life. Age is just a number when you have the right program.",
    story:
      "Karen started her fitness journey later in life. She was overweight and out of shape but determined to make a change. The Ultimate Bundle gave her everything she needed — beginner foundations, progressive glute building, and cardio programming. After 20 weeks, she lost 17 pounds, gained 4.5 inches on her glutes, and completely transformed her body and mindset.",
    tips: [
      "It's never too late to start — the best time is now",
      "Be patient with yourself — transformation takes time",
      "Invest in yourself — you're worth it",
    ],
    stats: [
      { label: "Duration", value: "20 weeks" },
      { label: "Workouts Completed", value: "80" },
      { label: "Glute Growth", value: "+4.5 inches" },
      { label: "Weight Change", value: "-17 lbs" },
    ],
    featured: true,
  },
];

export const TESTIMONIALS = [
  {
    quote:
      "The community alone is worth the price. Having women who understand your journey makes all the difference.",
    name: "Lisa M.",
    role: "Sculpt Pro Member",
    rating: 5,
  },
  {
    quote:
      "I've tried every fitness influencer's program. NOMICA is the only one that actually delivered results.",
    name: "Brittany K.",
    role: "Glute Bundle Customer",
    rating: 5,
  },
  {
    quote:
      "The Stairmaster program changed my relationship with cardio. I actually look forward to it now!",
    name: "Amanda R.",
    role: "Stairmaster Program",
    rating: 5,
  },
  {
    quote:
      "My coach personalized everything for my goals. I've never felt so supported in my fitness journey.",
    name: "Taylor S.",
    role: "Sculpt Pro Member",
    rating: 5,
  },
  {
    quote:
      "The 14-Day Challenge was the push I needed. Now I'm 6 months in and never looking back.",
    name: "Nicole P.",
    role: "Started with Challenge",
    rating: 5,
  },
  {
    quote:
      "Finally, a fitness brand that understands women's bodies. The programming is science-backed and effective.",
    name: "Rachel D.",
    role: "12-Week Glute Sculpt",
    rating: 5,
  },
];

export const STATS = [
  { label: "Active Members", value: "12,000+" },
  { label: "Transformations", value: "4,500+" },
  { label: "Workouts Delivered", value: "150,000+" },
  { label: "Average Rating", value: "4.9/5" },
];

export function getTransformationById(id: string): Transformation | undefined {
  return TRANSFORMATIONS.find((t) => t.id === id);
}

export function getFeaturedTransformations(): Transformation[] {
  return TRANSFORMATIONS.filter((t) => t.featured);
}
