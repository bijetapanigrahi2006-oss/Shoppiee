# Shoppiee — setup guide

Shoppiee is a price-comparison and AI shopping assistant built with Next.js 15, Supabase and Claude.

## 1. Connect Supabase (≈5 minutes)

1. Open your project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Go to **Project Settings → Data API** and copy the **Project URL** (`https://xxxx.supabase.co`).
3. Open `.env.local` in this folder and paste it:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...   ← already filled in
   ```
   Use the **publishable** key only. Never put the **secret** key (`sb_secret_…`) in this app. It bypasses every security rule.
4. Open **SQL Editor → New query**, paste the whole of `supabase/migrations/0001_init.sql`, and click **Run**. This creates:
   - all the tables, with Row Level Security (each user sees only their own data);
   - the trigger that creates a profile on signup;
   - the `avatars` (public) and `screenshots` (private) storage buckets.
5. Go to **Authentication → URL Configuration**:
   - Set **Site URL** to `http://localhost:3000`.
   - Add `http://localhost:3000/auth/callback` to **Redirect URLs**.
6. (Optional, for faster local testing) Go to **Authentication → Sign In / Providers → Email** and turn off **Confirm email**. Signups then log in immediately, without the confirmation email.

## 2. Turn on the AI (optional but recommended)

Get an API key from [platform.claude.com](https://platform.claude.com) and add it to `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Claude powers four things:
- understanding free-text needs;
- the Top 3 explanations and tradeoffs;
- the wording of the "Should I buy this?" verdict;
- screenshot recognition.

The default model is `claude-opus-5`. Set `CLAUDE_MODEL` to override it.

Without a key, everything still works using rule-based logic, with one exception: screenshot search then needs a short text hint, such as "white sneakers".

## 3. Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # unit tests for the price/verdict engine
npm run build    # production build
```

## What's real and what's simulated

| Area | Status |
|---|---|
| Auth, profiles, avatars, lists, wishlist, cart, orders, history, display settings | **Real**, stored in your Supabase |
| "Buy on Amazon / Myntra / …" links | **Real**: they open that store's search page for the product |
| Product catalog, prices, 180-day price history, reviews, coupons | **Simulated** demo catalog (`lib/providers/mock`), deterministic and refreshed daily |
| Product photos | **Real photos**, stored in `public/products`. Some show the exact product: snacks and groceries from Open Food Facts, book covers from Open Library, and perfumes and electronics from DummyJSON. Others are representative photos of the product type, from Wikimedia Commons and Openverse (Creative Commons; credits are shown on each product page). A live data provider will bring each store's own listing photos. |
| AI need-finder, verdict explanations, screenshot recognition | **Real** Claude calls when `ANTHROPIC_API_KEY` is set |
| Payment | Always on the store's own website. Shoppiee never handles money |
| Order status, cancel and return | Recorded when you confirm in the app. The buttons open the store's own orders page, because stores don't offer an API for this |

### Plugging in real prices later

Every data source implements `ProductProvider` (`lib/providers/types.ts`). To go live:
1. Add e.g. `lib/providers/serpapi.ts` implementing the same interface (Google Shopping India results).
2. Select it in `lib/providers/index.ts` with `DATA_PROVIDER=serpapi`.
3. Store prices daily (a Supabase cron) to build real price history.

No UI changes are needed.

## Project map

```
app/(auth)/          login & signup
app/(app)/           every signed-in page (home, search, product, assistant, cart, checkout, …)
app/api/assistant    AI need-finder endpoint
app/api/vision       screenshot → product endpoint
app/actions.ts       server actions (cart, wishlist, lists, checkout, orders, profile)
lib/analysis/        price stats, fake-discount detector, real price, scoring, BUY/WAIT/AVOID
lib/ai/              Claude calls (structured outputs + rule-based fallbacks)
lib/providers/       data-source interface + mock catalog
lib/theme/           category colour system
supabase/migrations  database schema + RLS + storage
```
