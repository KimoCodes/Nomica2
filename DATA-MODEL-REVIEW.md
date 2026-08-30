# Data Model Review

## Core Entities

### User
- `id` (String, cuid)
- `email` (String, unique)
- `name` (String?)
- `role` (UserRole: USER | COACH | ADMIN)
- `image` (String?)
- `emailVerified` (DateTime?)
- `onboardingComplete` (Boolean, default false)
- Relations: accounts, sessions, coachProfile, clientProfile, notifications

### ClientProfile
- `id` (String, cuid)
- `userId` (String, unique)
- `dateOfBirth` (DateTime?)
- `gender` (String?)
- `heightCm` (Float?)
- `weightKg` (Float?)
- `fitnessGoal` (FitnessGoal enum)
- `activityLevel` (ActivityLevel enum)
- `equipment` (Equipment enum)
- `healthConditions` (String?)
- `dietaryRestrictions` (String?)
- `bodyFatPercentage` (Float?)
- `weeklyWorkoutDays` (Int, default 3)
- `sessionDurationMinutes` (Int, default 60)
- Relations: user, programs, progressLogs, mealLogs, checkIns, transformations, workoutCompletions

### CoachProfile
- `id` (String, cuid)
- `userId` (String, unique)
- `specializations` (String[])
- `certifications` (String[])
- `yearsExperience` (Int?)
- `bio` (String?)
- `hourlyRate` (Float?)
- Relations: user, clients (via ClientAssignment)

### Program
- `id` (String, cuid)
- `clientProfileId` (String)
- `coachId` (String?)
- `name` (String)
- `description` (String?)
- `durationWeeks` (Int)
- `difficulty` (Int, 1-10)
- `isActive` (Boolean, default true)
- Relations: clientProfile, workouts, progressLogs

### Workout
- `id` (String, cuid)
- `programId` (String)
- `name` (String)
- `dayOfWeek` (Int?)
- `estimatedDurationMinutes` (Int)
- `isCompleted` (Boolean, default false)
- Relations: program, exercises

### WorkoutExercise
- `id` (String, cuid)
- `workoutId` (String)
- `exerciseId` (String)
- `order` (Int)
- `targetSets` (Int)
- `targetReps` (String, e.g., "8-12")
- `restSeconds` (Int, default 90)
- Relations: workout, exercise, sets

### Exercise
- `id` (String, cuid)
- `name` (String, unique)
- `muscleGroup` (MuscleGroup enum)
- `difficulty` (Int, 1-3)
- `instructions` (String?)
- `videoUrl` (String?)
- `equipment` (String?) — free text, not enum
- Relations: workoutExercises

### WorkoutSetLog
- `id` (String, cuid)
- `workoutExerciseId` (String)
- `setNumber` (Int)
- `actualReps` (Int)
- `actualWeight` (Float?)
- `completed` (Boolean, default true)
- Relations: workoutExercise

### WorkoutCompletion
- `id` (String, cuid)
- `userId` (String)
- `workoutId` (String)
- `completedAt` (DateTime)
- `duration` (Int?)
- `difficulty` (Int, 1-10)
- `energy` (Int, 1-10)
- `mood` (Int, 1-10)
- `notes` (String?)
- Relations: user

### CheckIn
- `id` (String, cuid)
- `clientProfileId` (String)
- `weekNumber` (Int)
- `weight` (Float?)
- `bodyFat` (Float?)
- `energyLevel` (Int, 1-10)
- `sleepHours` (Float?)
- `stressLevel` (Int, 1-10)
- `mood` (Int, 1-10)
- `completedAt` (DateTime)
- Relations: clientProfile

### ProgressLog
- `id` (String, cuid)
- `clientProfileId` (String)
- `programId` (String?)
- `loggedAt` (DateTime)
- `weight` (Float?)
- `bodyFat` (Float?)
- `notes` (String?)
- Relations: clientProfile, program

### MealLog
- `id` (String, cuid)
- `clientProfileId` (String)
- `loggedAt` (DateTime)
- `mealType` (MealType enum)
- Relations: clientProfile, items

### MealLogItem
- `id` (String, cuid)
- `mealLogId` (String)
- `foodName` (String)
- `calories` (Int)
- `proteinGrams` (Float?)
- `carbsGrams` (Float?)
- `fatGrams` (Float?)
- `region` (FoodRegion enum)
- `portionSize` (String?)
- Relations: mealLog

### Transformation
- `id` (String, cuid)
- `clientProfileId` (String)
- `title` (String)
- `description` (String?)
- `startWeight` (Float?)
- `startBodyFat` (Float?)
- `endWeight` (Float?)
- `endBodyFat` (Float?)
- `startDate` (DateTime)
- `endDate` (DateTime?)
- Relations: clientProfile

### Habit
- `id` (String, cuid)
- `userId` (String)
- `type` (String)
- `name` (String)
- `target` (Int, default 1)
- `current` (Int, default 0)
- `streak` (Int, default 0)
- `completed` (Boolean, default false)
- `completedAt` (DateTime?)
- Unique constraint: [userId, type]

### Conversation
- `id` (String, cuid)
- `clientId` (String)
- `coachId` (String)
- `createdAt` (DateTime)
- Relations: messages

### Message
- `id` (String, cuid)
- `conversationId` (String)
- `senderId` (String)
- `content` (String)
- `sentAt` (DateTime)
- `readAt` (DateTime?)
- Relations: conversation

### Notification
- `id` (String, cuid)
- `userId` (String)
- `type` (String)
- `title` (String)
- `message` (String)
- `read` (Boolean, default false)
- `data` (Json?)
- `createdAt` (DateTime)

### SupportTicket
- `id` (String, cuid)
- `userId` (String)
- `subject` (String)
- `description` (String)
- `status` (String)
- `createdAt` (DateTime)

## Key Relationships

```
User 1:1 ClientProfile
User 1:1 CoachProfile
User 1:N WorkoutCompletion
User 1:N Habit
User 1:N Notification

ClientProfile 1:N Program
ClientProfile 1:N ProgressLog
ClientProfile 1:N CheckIn
ClientProfile 1:N MealLog
ClientProfile 1:N Transformation

Program 1:N Workout
Workout 1:N WorkoutExercise
WorkoutExercise 1:N WorkoutSetLog
WorkoutExercise N:1 Exercise

MealLog 1:N MealLogItem
Conversation 1:N Message
```

## Known Gaps / Considerations

1. **Exercise.equipment** is free text — inconsistent with Equipment enum on ClientProfile
2. **WorkoutSetLog** has no targetReps/targetWeight — only actual values
3. **CheckIn** has no notes field
4. **Habit** uses `userId` not `clientProfileId` — separate from client data
5. **Conversation** uses `clientId` not `clientProfileId`
6. **ProgressLog** uses `loggedAt` not `date`
7. **MealLogItem** uses `foodName` not `name`
8. No explicit **Referral** model — implemented as in-memory service
9. No **Subscription** model — handled by Stripe externally
