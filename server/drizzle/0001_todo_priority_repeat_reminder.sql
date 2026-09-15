CREATE TYPE "public"."todo_priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."todo_repeat" AS ENUM('none', 'daily', 'weekly', 'monthly');--> statement-breakpoint
ALTER TABLE "todos" ADD COLUMN "priority" "todo_priority" DEFAULT 'medium' NOT NULL;--> statement-breakpoint
ALTER TABLE "todos" ADD COLUMN "repeat" "todo_repeat" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "todos" ADD COLUMN "reminder_minutes" integer;