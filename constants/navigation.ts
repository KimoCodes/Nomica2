export const COACH_NAV = [
  { label: "Dashboard", href: "/coach", icon: "dashboard" },
  { label: "Clients", href: "/coach/clients", icon: "clients" },
  { label: "Programs", href: "/coach/programs", icon: "programs" },
  { label: "Exercises", href: "/coach/exercises", icon: "exercises" },
  { label: "Media", href: "/coach/media", icon: "media" },
  { label: "Messages", href: "/coach/messages", icon: "messages" },
  { label: "Check-ins", href: "/coach/check-ins", icon: "check-ins" },
] as const;

export const CLIENT_NAV = [
  { label: "Dashboard", href: "/client", icon: "dashboard" },
  { label: "Workouts", href: "/client/workouts", icon: "workouts" },
  { label: "Exercises", href: "/client/exercise-library", icon: "exercises" },
  { label: "Nutrition", href: "/client/nutrition", icon: "nutrition" },
  { label: "Timers", href: "/client/timers", icon: "timers" },
  { label: "Progress", href: "/client/progress", icon: "progress" },
  { label: "Messages", href: "/client/messages", icon: "messages" },
  { label: "Check-ins", href: "/client/check-ins", icon: "check-ins" },
  { label: "Subscription", href: "/client/subscription", icon: "subscription" },
  { label: "Settings", href: "/settings", icon: "settings" },
] as const;

export const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin", icon: "dashboard" },
  { label: "Users", href: "/admin/users", icon: "clients" },
  { label: "Coaches", href: "/admin/coaches", icon: "clients" },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: "programs" },
] as const;
