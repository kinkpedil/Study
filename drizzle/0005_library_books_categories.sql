CREATE TABLE "library_books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"author" text NOT NULL,
	"publisher" text,
	"jenjang" "jenjang" NOT NULL,
	"kelas" text,
	"mapel" text NOT NULL,
	"category_id" uuid,
	"tahun" integer,
	"deskripsi" text,
	"sumber_url" text NOT NULL,
	"cover_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "library_books" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "library_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "library_categories_name_unique" UNIQUE("name"),
	CONSTRAINT "library_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "library_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "library_books" ADD CONSTRAINT "library_books_category_id_library_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."library_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "library_books_jenjang_idx" ON "library_books" USING btree ("jenjang");--> statement-breakpoint
CREATE INDEX "library_books_mapel_idx" ON "library_books" USING btree ("mapel");--> statement-breakpoint
CREATE INDEX "library_books_category_idx" ON "library_books" USING btree ("category_id");--> statement-breakpoint
CREATE POLICY "library_books_select" ON "library_books" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "library_categories_select" ON "library_categories" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);