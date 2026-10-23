# My Places

A calm personal map (React + Vite + Leaflet), with Vercel API functions and a Neon Postgres database.
Only places you save are shown. Directions open in Google Maps (no API key) and only when requested.

## Setup
1. `npm install`
2. Create a free Neon project at neon.tech and copy its connection string.
3. Copy `.env.example` to `.env.local` and fill in `DATABASE_URL` and `ACCESS_CODE`.
   (The `places` table is created automatically on first request; `db-schema.sql` is there for reference.)
4. Run locally with the Vercel CLI so the `/api` functions work: `npx vercel dev`
   (`npm run dev` alone serves the UI only, without the API.)

## Deploy to Vercel
1. Push this folder to a GitHub repo and import it at vercel.com/new (Vite is detected automatically).
2. Add environment variables `DATABASE_URL` and `ACCESS_CODE` (Project > Settings > Environment Variables).
3. Deploy. Open the site and enter your access code once per device.

## How it works
- **Access:** one shared access code (`ACCESS_CODE`) protects every API call; without it nobody can read or change places. If it is unset, the API refuses all requests.
- **Database:** all queries are parameterized and run only in `api/`. Inputs are validated on the server.
- **Categories:** "Vegan cafes" and "Gas stations" are built in; type any new name in the Category field to create more. "Favorites" and "All saved places" are filters.
- **Address lookup:** uses OpenStreetMap Nominatim via `/api/geocode`, only when you press Find (policy: max 1 request/second, no autocomplete). Coordinates like `41.64, 41.63` also work.
- **Tiles:** public OpenStreetMap tiles with attribution, fine for personal use. For heavy traffic use a tile provider with a free plan.
- **Starter vegan cafes:** `src/starter.js` is empty because no verified venue data was available. The map starts empty; add real places there or in the app.
- **Route preview on the map** (optional step 8) is not included. No distances or times are shown, since none come from a real routing service.

## Structure
`api/` server functions (`places.js`, `geocode.js`, `_lib.js`) · `src/components/` MapView, PlaceMarker, PlaceDetails, PlaceForm, PlaceFilters, PlaceSearch, DirectionsPanel, AppHeader

## Troubleshooting
- **Unlock screen keeps coming back:** the message under the field says why. "ACCESS_CODE is not set" or "DATABASE_URL is not set" means the server can't see your env vars: add them in Vercel (Settings > Environment Variables, enable all environments) and redeploy, or restart `npx vercel dev` after editing `.env.local`.
- **"The server API was not found":** you started with `npm run dev`. Use `npx vercel dev` or the deployed site.
- **"Could not reach the database":** re-copy the Neon connection string (it must end with `?sslmode=require`); Neon free databases may take a few seconds to wake up, so try again.
- Changing `ACCESS_CODE` on Vercel needs a redeploy; every device then asks for the new code.
