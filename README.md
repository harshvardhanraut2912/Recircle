# ReCircle — Circular Economy Marketplace

Next.js 14 + **Supabase** (Postgres database + Storage bucket). No MongoDB.

## Setup
1. Create a Supabase project.
2. Run `supabase/schema.sql` in **SQL Editor** (creates empty tables + the `product-images` bucket).
3. Copy `.env.example` to `.env.local` and fill in the values
   (Project Settings -> API: Project URL and `service_role` key).
4. `npm install && npm run dev` (http://localhost:3001)

## Deploy on Vercel
Add the same variables from `.env.example` in Vercel -> Project -> Settings -> Environment Variables, then deploy.

## How data flows
- Users, products, product_images and requests live in Postgres tables.
- Item photos are uploaded (server resizes to WebP) to the `product-images` bucket under `<user-id>/<uuid>.webp`;
  each file's public URL is stored in `product_images` (and `products.primary_image_url`).
- The database starts with 0 items; everything is created by users through the app.
- All DB access happens in server API routes with the service-role key; RLS blocks direct public access.
