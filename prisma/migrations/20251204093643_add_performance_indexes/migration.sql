-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "appointments_provider_id_status_start_time_end_time_idx" ON "appointments"("provider_id", "status", "start_time", "end_time");

-- CreateIndex
CREATE INDEX "appointments_user_id_created_at_idx" ON "appointments"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "break_times_provider_id_day_of_week_idx" ON "break_times"("provider_id", "day_of_week");

-- CreateIndex
CREATE INDEX "notifications_provider_id_created_at_idx" ON "notifications"("provider_id", "created_at");

-- CreateIndex
CREATE INDEX "operating_hours_provider_id_day_of_week_idx" ON "operating_hours"("provider_id", "day_of_week");

-- CreateIndex
CREATE INDEX "session_userId_expiresAt_idx" ON "session"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "system_feedback_is_resolved_created_at_idx" ON "system_feedback"("is_resolved", "created_at");
