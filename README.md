# Globex Couriers and Logistics

A full-stack courier tracking system built with Next.js 14 (App Router), MongoDB Atlas, and Tailwind CSS.

## Features

- **Public**: Home page with tracking input → `/track/[trackingNumber]`
- **Tracking**: View shipment details or "Shipment Not Found"
- **Admin** (protected): Dashboard, create shipment, bulk Excel upload, filters, pagination
- **Auth**: Simple cookie-based login (admin / admin123)
- **Bonus**: Delete shipment, inline status update in table

## Quick Start

1. **Install**
   ```bash
   npm install
   ```

2. **Environment**
   - Copy `.env.example` to `.env.local`
   - Set `MONGODB_URI` to your MongoDB Atlas connection string

3. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

4. **Admin**
   - Go to `/admin` → login with **admin** / **admin123**
   - First load seeds dummy data if the collection is empty

## Project Structure

```
/app          → pages (home, track, admin)
/app/api      → auth, shipments, upload
/lib          → mongodb, auth, shipment schema, seed
```

## Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for MongoDB Atlas setup and Vercel deployment steps.

## Tech Stack

- Next.js 14 (App Router)
- MongoDB Atlas + Mongoose
- Tailwind CSS
- No UI library; minimal, responsive UI
