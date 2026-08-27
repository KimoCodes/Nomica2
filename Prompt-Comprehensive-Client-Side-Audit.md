# Prompt: Comprehensive Client-Side Audit & Implementation for a Premium Feminine Transformation Fitness Platform

Your task is to perform a complete audit of the client-side application, identify what is already implemented, determine what is missing, and implement the missing functionality to create a production-ready premium feminine transformation fitness platform.

## Objective

Treat the current codebase as the single source of truth. Do not assume features exist without verifying them.

Your responsibilities are to:

* Audit every page, component, route, API integration, state management, and UI flow.
* Identify completed, partially completed, missing, duplicated, broken, or placeholder functionality.
* Fix bugs and inconsistencies discovered during the audit.
* Implement missing features using the existing architecture and coding standards.
* Improve the overall user experience while maintaining consistency throughout the application.
* Avoid introducing unnecessary complexity or duplicate implementations.

---

# Phase 1 — Full System Audit

Inspect the entire client application.

Audit:

* Pages
* Components
* Layouts
* Navigation
* Routes
* Authentication flow
* Protected routes
* State management
* API calls
* Forms
* Validation
* Error handling
* Loading states
* Empty states
* Notifications
* Responsive behavior
* Accessibility
* Performance
* Theme consistency

Create an audit report showing:

* ✅ Fully implemented
* 🟡 Partially implemented
* ❌ Missing
* ⚠ Needs improvement
* 🐞 Bugs discovered

For every issue found, explain:

* What exists
* What's missing
* Why it matters
* Proposed solution

---

# Phase 2 — Authentication

Verify and improve:

* Sign Up
* Sign In
* Logout
* Forgot Password
* Reset Password
* Email Verification (if supported)
* Profile completion
* Session persistence
* Token refresh
* Protected routes
* Role-based access
* Secure logout
* Error handling
* Form validation
* Loading indicators

---

# Phase 3 — Subscription System

Audit and complete:

* Membership plans
* Subscription comparison
* Payment page
* Upload payment proof
* Payment history
* Pending verification status
* Active subscription
* Expired subscription
* Cancelled subscription
* Remaining subscription days
* Expiration date
* Renewal reminders

Requirements:

* Users without an active subscription must always have access to the Payments page.
* Restricted premium pages should clearly explain why access is blocked and guide the user to subscribe.
* Display subscription status prominently throughout the application where appropriate.

---

# Phase 4 — Dashboard

Ensure the dashboard includes:

* Welcome section
* User profile summary
* Subscription status
* Current program
* Today's workout
* Today's nutrition
* Coach announcements
* Progress summary
* Current streak
* Upcoming check-in
* Quick actions
* Recent activity

The dashboard should personalize content for each user.

---

# Phase 5 — Workout Experience

Audit and implement:

* Program library
* Program details
* Daily workouts
* Workout calendar
* Exercise list
* Exercise detail page
* Exercise videos
* Instructions
* Sets
* Repetitions
* Rest timer
* Difficulty
* Equipment
* Workout duration
* Target muscles
* Complete workout
* Resume workout
* Skip workout
* Favorite workouts
* Workout history

---

# Phase 6 — Nutrition

Implement:

* Meal plans
* Daily nutrition
* Recipes
* Grocery lists
* Calories
* Protein goals
* Macronutrients
* Water tracker
* Supplement recommendations
* Meal completion
* Favorite recipes

---

# Phase 7 — Progress Tracking

Implement:

* Weight tracking
* Body measurements
* Body fat
* BMI
* Strength tracking
* Progress charts
* Historical timeline
* Progress summaries

---

# Phase 8 — Progress Photos

Implement:

* Front photo
* Side photo
* Back photo
* Before/After comparison
* Timeline
* Secure private storage
* Upload validation
* Image preview
* Zoom

---

# Phase 9 — Weekly Check-ins

Allow users to submit:

* Weight
* Measurements
* Photos
* Energy level
* Mood
* Sleep
* Water intake
* Notes

Display coach feedback when available.

---

# Phase 10 — Coach Communication

Audit:

* Messaging
* Coach feedback
* Announcements
* File sharing
* Images
* Video attachments
* Voice notes (if supported)
* Read receipts
* Typing indicators
* Notification integration

---

# Phase 11 — Community

Audit and implement:

* Community feed
* Posts
* Images
* Comments
* Likes
* Success stories
* Challenges
* Community guidelines

---

# Phase 12 — Goals & Habits

Implement:

Goals

* Lose weight
* Build muscle
* Grow glutes
* Improve fitness

Habit tracker

* Water
* Sleep
* Protein
* Stretching
* Steps
* Vitamins

Display:

* Daily streaks
* Completion percentages
* Progress bars

---

# Phase 13 — Educational Resources

Implement:

* Articles
* Videos
* PDFs
* Workout guides
* Nutrition education
* Recovery education
* Mindset education
* Women's health resources

Include:

* Categories
* Search
* Filtering
* Favorites

---

# Phase 14 — Notifications

Audit:

* In-app notifications
* Workout reminders
* Coach messages
* Subscription reminders
* Payment approval
* Challenge reminders
* Check-in reminders

Ensure notification badges update correctly.

---

# Phase 15 — Downloads

Allow users to download:

* PDFs
* Workout plans
* Meal plans
* Grocery lists
* Educational resources

---

# Phase 16 — Settings

Audit:

* Profile
* Password
* Units
* Theme
* Language
* Notification preferences
* Privacy settings

---

# Phase 17 — Achievements

Implement badges such as:

* First Workout
* 7-Day Streak
* 30-Day Streak
* Goal Completed
* Program Completed

---

# Phase 18 — Search

Implement global search across:

* Exercises
* Programs
* Recipes
* Articles
* Videos

---

# Phase 19 — Favorites

Allow users to save:

* Exercises
* Programs
* Recipes
* Videos
* Articles

---

# Phase 20 — Mobile Experience

Audit:

* Responsive layouts
* Mobile navigation
* Touch interactions
* Loading performance
* Orientation handling
* Small-screen usability
* Offline-friendly behavior where appropriate

---

# Phase 21 — Accessibility

Ensure:

* Keyboard navigation
* Screen-reader support
* Proper labels
* Focus indicators
* Color contrast
* Semantic HTML
* Accessible forms

---

# Phase 22 — Performance

Optimize:

* Lazy loading
* Code splitting
* Image optimization
* Bundle size
* API efficiency
* Component rendering
* Caching
* Skeleton loaders

---

# Phase 23 — UI/UX Consistency

Ensure:

* Consistent spacing
* Typography
* Buttons
* Cards
* Icons
* Colors
* Animations
* Empty states
* Error messages
* Loading states

Maintain a premium feminine aesthetic throughout the application.

---

# Phase 24 — Code Quality

Refactor where necessary.

Remove:

* Dead code
* Duplicate components
* Unused files
* Placeholder content
* Mock data
* Console logs
* Deprecated code

Improve:

* Folder structure
* Naming conventions
* Reusability
* Type safety
* Error handling
* Maintainability

---

Execution Rules

Do not begin implementing until the audit report is complete.
Treat the current codebase as the source of truth.
splitting the work into phases with explicit checkpoints.
Never duplicate existing functionality.
Reuse existing components, hooks, services, API clients, utilities, and styles whenever possible.
If a feature exists but is incomplete, finish it instead of replacing it.
If implementing a feature requires backend support that does not exist, clearly document the required backend changes before proceeding.
After each completed feature, verify functionality, responsiveness, accessibility, loading states, error handling, and edge cases.
Keep the application production-ready at all times; avoid leaving partially implemented or broken features.
Maintain an audit matrix with the status of every feature (Implemented, Partially Implemented, Missing, Buggy, Completed).
Do not mark a feature as complete until it has been implemented, integrated with existing systems, tested, and verified.

The final result should be a polished, scalable, mobile-first, production-ready client application that delivers a seamless premium feminine transformation experience with a consistent, elegant user interface and reliable functionality.
