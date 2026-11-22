# ReCircle — Premium Circular Economy Marketplace

A modern, sustainable second-hand marketplace designed for verified pre-loved electronics, furniture, fashion, and mobility.

## 🚀 Key Highlights

1. **Zero External Image Hosting (100% MongoDB GridFS)**:
   - Completely removes Cloudinary and external image hosts.
   - Uploaded product image binaries are processed with **Sharp** (resized to optimal dimensions, metadata stripped, WebP compressed) and streamed directly into **MongoDB GridFS** (`product_images.files` and `product_images.chunks`).
   - Image retrieval streams binary data through `/api/images/[id]` with `ETag`, `Cache-Control`, and `Content-Length` headers.
   - Associated metadata tracks `productId`, `sellerId`, `isPrimary`, `position`, `size`, and `uploadDate`.
   - When a product is deleted, associated GridFS image chunks are automatically cleaned up.
   - Fully compatible with Vercel serverless functions and local environments.

2. **Commercial-Grade UI/UX Design System**:
   - **Colors**: Deep Forest Green (`#0d3829`), Fresh Mint Green (`#10b981`), Warm Off-White (`#FAF9F6`), and Charcoal (`#18181b`).
   - **Marketplace Homepage**: Hero section with circular impact meter, live search, city selector, category bar, filter sidebar & mobile drawer, sorting controls, and verified badges.
   - **Product Details Page**: Large image gallery with thumbnail navigation, savings calculation, carbon offset estimate, condition details, seller profile, buyer protection guarantee, and "Make an Offer" modal.
   - **6-Step Sell Wizard**: Step-by-step listing experience with direct GridFS upload, primary image selector, condition grading, proof history, and live preview.
   - **SaaS Seller Dashboard**: Analytics cards, My Listings management, Purchase Inquiries inbox with status filters (New, Accepted, Completed, Rejected), and empty states.
   - **Mobile-First Responsive Layout**: Bottom sticky navigation for mobile screens and slide-over drawers.

---

## 🌐 Local Testing URLs

The application is running locally at:

- **Marketplace Homepage**: [http://localhost:3001/](http://localhost:3001/)
- **Sell an Item (6-Step Wizard)**: [http://localhost:3001/sell](http://localhost:3001/sell)
- **Seller Dashboard (Overview)**: [http://localhost:3001/dashboard](http://localhost:3001/dashboard)
- **Purchase Inquiries / Inbox**: [http://localhost:3001/dashboard?tab=inquiries](http://localhost:3001/dashboard?tab=inquiries)
- **My Listings Management**: [http://localhost:3001/dashboard?tab=listings](http://localhost:3001/dashboard?tab=listings)
- **Saved Wishlist**: [http://localhost:3001/wishlist](http://localhost:3001/wishlist)

---

## 🛠️ Environment Configuration

`.env.local` is already configured:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/recircle
MONGODB_DB=recircle
NEXT_PUBLIC_APP_URL=http://localhost:3001
PORT=3001
```

> **To connect MongoDB Atlas**:
> Simply replace `MONGODB_URI` in `.env.local` with your Atlas connection string:
> `MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/recircle?retryWrites=true&w=majority`

---

## 📦 Running & Testing Commands

- **Start Dev Server**: `npm run dev` (runs on port 3001)
- **Production Build**: `npm run build`
- **Start Production Server**: `npm run start` (runs on port 3001)
- **Seed Realistic Products with GridFS Images**: `npm run seed`
