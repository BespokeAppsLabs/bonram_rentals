# Convex Setup Guide

This guide explains how to connect the Bonram Rentals portal to Convex.

## Prerequisites

1. A Convex account (free tier available)
2. Node.js 18+ installed

## Step 1: Create a Convex Project

1. Go to [https://dashboard.convex.dev](https://dashboard.convex.dev)
2. Sign in or create an account
3. Click "Create new project"
4. Name it "bonram-rentals"
5. Choose a region close to your users (e.g., Europe or US East)

## Step 2: Initialize Convex in Your Project

Run the following command in the `website` directory:

```bash
cd website
npx convex dev
```

This will:
1. Prompt you to log in to Convex
2. Create a new deployment (or link to existing)
3. Generate the `_generated/` folder with TypeScript types
4. Push your schema to the database
5. Start watching for changes

## Step 3: Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Then update `.env.local` with your Convex URL:

```env
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-name.convex.cloud
```

You can find your Convex URL in the Convex dashboard under Settings > Deployment URL.

## Step 4: Seed Initial Data

After running `npx convex dev`, you can seed products using the Convex dashboard:

1. Go to [https://dashboard.convex.dev](https://dashboard.convex.dev)
2. Select your project
3. Click on "Data" in the sidebar
4. Click "Add Document" for the `products` table

### Sample Product Data

```json
{
  "name": "VIP Toilet Trailer",
  "description": "Premium trailer-mounted toilet facilities with porcelain fixtures, perfect for upscale events.",
  "category": "Sanitation",
  "dailyRate": 850,
  "totalStock": 6,
  "minGuests": 50,
  "maxGuests": 200,
  "isActive": true,
  "createdAt": 1707907200000,
  "updatedAt": 1707907200000
}
```

### Products to Seed

| Name | Category | Daily Rate | Stock | Min Guests | Max Guests |
|------|----------|------------|-------|------------|------------|
| VIP Toilet Trailer | Sanitation | 850 | 6 | 50 | 200 |
| Standard Portable Toilet | Sanitation | 150 | 50 | 1 | 100 |
| White Event Tent (10x20m) | Structures | 3500 | 3 | 100 | 200 |
| Medium Tent (6x12m) | Structures | 1800 | 5 | 50 | 100 |
| MW8000D Generator | Power | 650 | 8 | 1 | 100 |
| Large Generator (15kW) | Power | 1200 | 4 | 100 | 300 |
| Standard PA System | Audio | 800 | 6 | 50 | 100 |
| XL Audio Package | Audio | 1500 | 3 | 100 | 500 |
| Plastic Chairs | Seating | 5 | 500 | 1 | 500 |
| Tiffany Chairs | Seating | 25 | 200 | 1 | 200 |
| Round Tables (1.8m) | Seating | 75 | 40 | 1 | 400 |
| Stage Platform (2x4m) | Structures | 450 | 6 | 50 | 500 |

## Step 5: Verify Connection

Start your Next.js development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and verify:
1. The homepage loads
2. The catalog page shows products (if seeded)
3. No console errors about Convex connection

## Troubleshooting

### "Cannot find module '@/convex/_generated/api'"

This error occurs when Convex hasn't been initialized yet. Run:

```bash
npx convex dev
```

This generates the `_generated/` folder with TypeScript types.

### "NEXT_PUBLIC_CONVEX_URL is not defined"

Make sure you've:
1. Created `.env.local` from `.env.example`
2. Added your Convex deployment URL
3. Restarted the development server

### "Unauthorized" errors

If using Clerk authentication:
1. Ensure Clerk is properly configured
2. Check that the user has the correct role
3. Verify the Convex auth provider matches Clerk

## Development Workflow

### Running Convex Locally

```bash
# Terminal 1: Convex development
cd website
npx convex dev

# Terminal 2: Next.js development
cd website
npm run dev
```

### Deploying to Production

1. Push your Convex functions:
```bash
npx convex deploy
```

2. Deploy your Next.js app (Vercel recommended):
```bash
vercel --prod
```

3. Update environment variables in production with the production Convex URL.

## Useful Convex Commands

| Command | Description |
|---------|-------------|
| `npx convex dev` | Start development mode (watches for changes) |
| `npx convex deploy` | Deploy to production |
| `npx convex dashboard` | Open Convex dashboard |
| `npx convex run` | Run a function manually |
| `npx convex import` | Import data from JSON |
| `npx convex export` | Export data to JSON |

## Next Steps

After setting up Convex:

1. Configure Clerk authentication
2. Set up Google Maps API for location autocomplete
3. Add product images to Convex storage
4. Implement email notifications for quote submissions
