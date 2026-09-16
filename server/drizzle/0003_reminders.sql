ALTER TYPE "public"."notification_type" ADD VALUE 'todo_reminder' BEFORE 'family_archived';--> statement-breakpoint
ALTER TABLE "todos" ADD COLUMN "reminder_sent_at" timestamp with time zone;