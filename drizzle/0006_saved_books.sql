CREATE TABLE "saved_books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"book_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "saved_books_profile_book_uq" UNIQUE("profile_id","book_id")
);
--> statement-breakpoint
ALTER TABLE "saved_books" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "saved_books" ADD CONSTRAINT "saved_books_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_books" ADD CONSTRAINT "saved_books_book_id_library_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."library_books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "saved_books_profile_idx" ON "saved_books" USING btree ("profile_id","created_at");--> statement-breakpoint
CREATE POLICY "saved_books_owner" ON "saved_books" AS PERMISSIVE FOR ALL TO "authenticated" USING ("saved_books"."profile_id" = (select auth.uid())) WITH CHECK ("saved_books"."profile_id" = (select auth.uid()));