-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "confirmation_email_sent_at" TIMESTAMP(3),
ADD COLUMN     "reminder_1h_sent_at" TIMESTAMP(3),
ADD COLUMN     "reminder_24h_sent_at" TIMESTAMP(3);
