-- CreateEnum
CREATE TYPE "FeedbackCategory" AS ENUM ('FEATURE_REQUEST', 'BUG_REPORT', 'IMPROVEMENT', 'USER_EXPERIENCE', 'OTHER');

-- CreateEnum
CREATE TYPE "FeedbackPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "system_feedback" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" "FeedbackCategory" NOT NULL,
    "priority" "FeedbackPriority" DEFAULT 'MEDIUM',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "satisfaction_rating" SMALLINT,
    "admin_response" TEXT,
    "responded_at" TIMESTAMP(3),
    "responded_by_id" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "system_feedback_user_id_idx" ON "system_feedback"("user_id");

-- CreateIndex
CREATE INDEX "system_feedback_category_idx" ON "system_feedback"("category");

-- CreateIndex
CREATE INDEX "system_feedback_is_read_is_resolved_idx" ON "system_feedback"("is_read", "is_resolved");

-- CreateIndex
CREATE INDEX "system_feedback_created_at_idx" ON "system_feedback"("created_at");

-- AddForeignKey
ALTER TABLE "system_feedback" ADD CONSTRAINT "system_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_feedback" ADD CONSTRAINT "system_feedback_responded_by_id_fkey" FOREIGN KEY ("responded_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
