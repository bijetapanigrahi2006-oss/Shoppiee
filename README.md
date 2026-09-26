# Shoppiee

Just creating an app which can compare prices of different products from different platforms, compare and suggest the best offer.

Shoppiee is a shopping assistant that shops *with* you. It compares prices across stores, flags fake discounts, and tells you whether to buy now or wait. It also works from a description of what you need, or a screenshot of something you like, to find the right product.

## Features

- **Price comparison** across Amazon, Flipkart, Myntra, Ajio, Nykaa, Snapdeal, Tata CLiQ, Croma, Reliance Digital, Titan, Meesho, BigBasket, Blinkit and JioMart.
- **AI need-finder.** Describe what you need in plain words (e.g. "a laptop for college coding under 60k"). Shoppiee turns it into requirements, compares the options and explains the tradeoffs behind its top 3 picks.
- **Sale reality check.** Compares the advertised discount with the product's real 180-day price history to catch inflated MRPs.
- **"Should I buy this?"** Paste a product link and get a BUY / WAIT / AVOID verdict, with the reasons behind it.
- **Screenshot search.** Upload a photo of a product and get the exact match, similar items, and cheaper alternatives.
- **Price history charts, price alerts, coupons and "real price" after offers.**
- **Multi-store cart with guided checkout.** Payment always happens on the store's own website; Shoppiee never handles money.
- **Orders, delivery tracking, cancel and return**, plus wishlist, shopping lists and buying and payment history.
- **Profiles** with illustrated avatars, and display settings: a dark or light theme, accent colour and density.

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Supabase (auth, Postgres with row-level security, storage) · Claude API · Three.js / React Three Fiber · Framer Motion · Recharts

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase URL and key
npm run dev                  # http://localhost:3000
```

[SETUP.md](SETUP.md) covers the full setup: creating the Supabase project, running the database migration and adding an optional Claude API key.

```bash
npm test         # unit tests for the price and verdict engine
npm run build    # production build
```

## Current status

Accounts, carts, lists, orders and settings are real and stored in Supabase. Product prices, price history and reviews come from a simulated demo catalog (`lib/providers/mock`) behind a pluggable data-provider interface, so a live price source can replace it without UI changes.

Some product photos show the exact product: groceries and snacks come from Open Food Facts, and book covers from Open Library. Others are Creative Commons photos of the product type from Wikimedia Commons and Openverse, credited on each product page.
