# Database Performance

## Database
- **Provider**: Neon PostgreSQL (serverless)
- **ORM**: Prisma 7.x
- **Connection**: Pooled via Prisma Accelerate

## Query Optimization
- **Caching**: request-cache.ts with 5-minute TTL
- **Batch operations**: Prisma createMany/updateMany
- **Selective fields**: Only query needed columns
- **Pagination**: Cursor-based for large datasets

## Indexes (Recommended)
```sql
-- User lookups
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_role ON "User"(role);

-- Client profile
CREATE INDEX idx_client_profile_user ON "ClientProfile"(userId);

-- Workout queries
CREATE INDEX idx_workout_program ON "Workout"(programId);
CREATE INDEX idx_workout_exercise_workout ON "WorkoutExercise"(workoutId);
CREATE INDEX idx_workout_exercise_exercise ON "WorkoutExercise"(exerciseId);

-- Progress tracking
CREATE INDEX idx_progress_log_client ON "ProgressLog"(clientProfileId);
CREATE INDEX idx_progress_log_date ON "ProgressLog"(loggedAt);
CREATE INDEX idx_checkin_client ON "CheckIn"(clientProfileId);
CREATE INDEX idx_meal_log_client ON "MealLog"(clientProfileId);

-- Habit tracking
CREATE INDEX idx_habit_user ON "Habit"(userId);
CREATE INDEX idx_habit_user_type ON "Habit"(userId, type);

-- Notifications
CREATE INDEX idx_notification_user ON "Notification"(userId);
CREATE INDEX idx_notification_read ON "Notification"(userId, read);

-- Messages
CREATE INDEX idx_message_conversation ON "Message"(conversationId);
CREATE INDEX idx_conversation_client ON "Conversation"(clientId);
```

## Connection Management
- **Prisma Accelerate**: Connection pooling
- **Serverless**: Auto-scaling with Neon
- **Timeout**: 30s query timeout recommended

## Monitoring
- **Sentry**: Database query performance
- **Prisma Studio**: Schema inspection
- **Neon Dashboard**: Query analytics

## Backup Strategy
- **Neon**: Automatic daily backups
- **Point-in-time recovery**: Available via Neon
- **Manual export**: pg_dump capability
