# UX Quality Standard

## Design Tokens (design-tokens.ts)
- **Primary**: `hsl(221.2 83.2% 53.3%)` — Blue
- **Destructive**: `hsl(0 84.2% 60.2%)` — Red
- **Background**: `hsl(0 0% 100%)` — White
- **Foreground**: `hsl(222.2 84% 4.9%)` — Near black
- **Muted**: `hsl(210 40% 96.1%)` — Light gray
- **Border radius**: sm (4px), md (6px), lg (8px), xl (12px)

## Component Patterns (patterns.tsx)
- **StatsCard**: Icon + value + label + trend indicator
- **MetricCard**: Title + value + subtitle
- **ProgressCard**: Label + progress bar + percentage
- **InfoCard**: Icon + title + description

## Loading States (skeletons.tsx)
- **StatsGridSkeleton**: 4-card grid with pulsing placeholders
- **WorkoutListSkeleton**: 3-row list with icon + text placeholders
- **ChartSkeleton**: Bar chart placeholder
- **ProfileSkeleton**: Avatar + form fields
- **DashboardSkeleton**: Full page skeleton

## Error States (error-display.tsx)
- **ErrorDisplay**: Icon + title + description + retry button
- **EmptyState**: Icon + title + description + optional action button

## Mobile-First (use-responsive.ts)
- **useIsMobile()**: < 768px
- **useIsTablet()**: 768px - 1024px
- **useIsDesktop()**: > 1024px
- **useBreakpoint()**: 'mobile' | 'tablet' | 'desktop'

## Mobile Components
- **MobileNav**: Bottom navigation with 4 tabs
- **PullToRefresh**: Touch gesture to refresh content
- **SwipeableTabs**: Touch swipe between tabs
- **MobileWorkoutCard**: Compact workout card for mobile
- **QuickActionFAB**: Floating action button for quick actions

## Accessibility
- All interactive elements have `aria-label`
- Color contrast meets WCAG AA (4.5:1)
- Focus states visible on all interactive elements
- Screen reader friendly labels

## Animation
- Transitions: 200ms ease-in-out
- Hover states: scale(1.02) on cards
- Loading: pulse animation on skeletons
- Page transitions: fade in/out
