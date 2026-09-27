# Drift · Opal Sol — Review Tracker

A small, dependency-free web app for keeping tabs on reviews of
[Drift at Opal Sol](https://www.opalcollection.com/opal-sol/restaurants/drift/)
(400 Coronado Dr, Clearwater Beach, FL) across review sites.

## What it does

- **Dashboard** — current rating and review count per site, change since the last
  check, a combined score weighted by review count, and a "needs a response" queue
  (lowest ratings first).
- **Reviews** — every tracked review in one list, with search and filters by site,
  stars and response status. Mark reviews as responded, add tags and internal notes.
- **Trends** — rating over time per site, and review volume per month.
- **Sites & Data** — turn sites on/off, edit listing URLs, add any other site,
  import CSV/JSON, export a backup.

Data is stored in your browser (localStorage). Use **Export JSON** to back it up or
move it to another device.

## Sites tracked

| Site | Default | Why |
|---|---|---|
| Google | on | Most-read restaurant reviews (Maps & Search) |
| Yelp | on | [yelp.com/biz/drift-clearwater](https://www.yelp.com/biz/drift-clearwater) |
| Tripadvisor | on | [Drift – Opal Sol listing](https://www.tripadvisor.com/Restaurant_Review-g34141-d32976337-Reviews-Drift_Opal_Sol-Clearwater_Florida.html); travelers plan beach-trip meals here, and the city ranking is worth tracking |
| **OpenTable** (recommended) | on | Reviews only from verified diners who booked — a clean read on service |
| **Facebook** (recommended) | on | Recommendations on the Opal Sol page plus local dining groups |
| Wanderlog | off | Trip-planner listing; mostly re-summarizes Google reviews |
| Mindtrip | off | AI travel planner; worth checking how it describes Drift |

## Running it

Open `index.html` directly, or serve the folder so automatic sync data loads:

```sh
cd review-tracker
python3 -m http.server 8080   # then visit http://localhost:8080
```

## Getting reviews in

1. **By hand** — "Log rating" on a site card records its current rating/count;
   "+ Review" adds an individual review.
2. **CSV import** — columns `platform, author, rating, date, title, text, url`
   (optional: `tags, responded, note`). See `data/sample-import.csv`.
3. **Automatic sync** — Google, Yelp and Tripadvisor don't allow browsers to read
   their pages directly, so `sync/sync.mjs` uses their official APIs and writes
   `data/synced.json`. The app merges it on load (duplicates are skipped; your
   "responded" flags and notes are kept).

   ```sh
   GOOGLE_PLACES_API_KEY=... YELP_API_KEY=... TRIPADVISOR_API_KEY=... \
     node review-tracker/sync/sync.mjs
   ```

   Any key you don't set is skipped. Run it daily (e.g. with cron) to build up the
   rating history.

   | Key | Where to get it | Notes |
   |---|---|---|
   | `GOOGLE_PLACES_API_KEY` | Google Cloud console → enable **Places API (New)** | Returns rating, count and the 5 most relevant reviews |
   | `YELP_API_KEY` | [Yelp Fusion](https://docs.developer.yelp.com/) | Rating/count on all plans; review excerpts need a plan that includes them |
   | `TRIPADVISOR_API_KEY` | [Tripadvisor Content API](https://www.tripadvisor.com/developers) | Returns rating, count, city ranking and 5 recent reviews |

   OpenTable and Facebook have no public review API for this, so log those by hand
   or via CSV.

The APIs return only a handful of recent reviews per call, so sync regularly to
build a complete history. For full review management (replying from one place),
the owner accounts — Google Business Profile, Yelp for Business and Tripadvisor
Management Center — are the places to respond.
