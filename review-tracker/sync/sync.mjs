#!/usr/bin/env node
/**
 * Pulls ratings and recent reviews for Drift · Opal Sol from each site's
 * official API and merges them into ../data/synced.json, which the tracker
 * app loads automatically.
 *
 * Requires Node 18+ (built-in fetch). Every source is optional: a source
 * without an API key is skipped.
 *
 *   GOOGLE_PLACES_API_KEY   Google Places API (New) key
 *   GOOGLE_PLACE_ID         optional; looked up by name if omitted
 *   YELP_API_KEY            Yelp Fusion API key
 *   YELP_BUSINESS_ID        default: drift-clearwater
 *   TRIPADVISOR_API_KEY     Tripadvisor Content API key
 *   TRIPADVISOR_LOCATION_ID default: 32976337
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'synced.json');
const TODAY = new Date().toISOString().slice(0, 10);
const env = process.env;

async function getJSON(url, init = {}) {
  const res = await fetch(url, init);
  const body = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${body.slice(0, 200)}`);
  return JSON.parse(body);
}

async function google() {
  const key = env.GOOGLE_PLACES_API_KEY;
  if (!key) return null;
  let placeId = env.GOOGLE_PLACE_ID;
  if (!placeId) {
    const found = await getJSON('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress' },
      body: JSON.stringify({ textQuery: 'Drift, Opal Sol, 400 Coronado Dr, Clearwater Beach, FL' }),
    });
    placeId = found.places?.[0]?.id;
    if (!placeId) throw new Error('Could not find Drift on Google Places');
    console.log(`  Google place: ${found.places[0].displayName?.text} (${placeId}) — set GOOGLE_PLACE_ID to skip lookup`);
  }
  const p = await getJSON(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'rating,userRatingCount,reviews,googleMapsUri' },
  });
  return {
    snapshot: { platform: 'google', date: TODAY, rating: p.rating, count: p.userRatingCount },
    reviews: (p.reviews || []).map(r => ({
      platform: 'google',
      externalId: r.name,
      author: r.authorAttribution?.displayName || '',
      rating: r.rating,
      date: (r.publishTime || '').slice(0, 10),
      text: r.originalText?.text || r.text?.text || '',
      url: r.googleMapsUri || p.googleMapsUri || '',
    })),
  };
}

async function yelp() {
  const key = env.YELP_API_KEY;
  if (!key) return null;
  const id = env.YELP_BUSINESS_ID || 'drift-clearwater';
  const headers = { Authorization: `Bearer ${key}`, Accept: 'application/json' };
  const biz = await getJSON(`https://api.yelp.com/v3/businesses/${id}`, { headers });
  let reviews = [];
  try {
    // Review excerpts require a Yelp plan that includes them; ratings still sync without.
    const r = await getJSON(`https://api.yelp.com/v3/businesses/${id}/reviews?limit=20&sort_by=newest`, { headers });
    reviews = r.reviews || [];
  } catch (e) {
    console.warn(`  Yelp reviews unavailable (${e.message.slice(0, 80)}) — rating only`);
  }
  return {
    snapshot: { platform: 'yelp', date: TODAY, rating: biz.rating, count: biz.review_count },
    reviews: reviews.map(r => ({
      platform: 'yelp',
      externalId: r.id,
      author: r.user?.name || '',
      rating: r.rating,
      date: (r.time_created || '').slice(0, 10),
      text: r.text || '',
      url: r.url || '',
    })),
  };
}

async function tripadvisor() {
  const key = env.TRIPADVISOR_API_KEY;
  if (!key) return null;
  const id = env.TRIPADVISOR_LOCATION_ID || '32976337';
  const base = 'https://api.content.tripadvisor.com/api/v1/location';
  const headers = { Accept: 'application/json' };
  const d = await getJSON(`${base}/${id}/details?key=${key}&language=en&currency=USD`, { headers });
  const r = await getJSON(`${base}/${id}/reviews?key=${key}&language=en`, { headers });
  return {
    snapshot: {
      platform: 'tripadvisor', date: TODAY,
      rating: Number(d.rating), count: Number(d.num_reviews),
      rank: d.ranking_data?.ranking_string || null,
    },
    reviews: (r.data || []).map(x => ({
      platform: 'tripadvisor',
      externalId: String(x.id),
      author: x.user?.username || '',
      rating: x.rating,
      date: (x.published_date || '').slice(0, 10),
      title: x.title || '',
      text: x.text || '',
      url: x.url || '',
    })),
  };
}

async function main() {
  let out = { snapshots: [], reviews: [] };
  try { out = JSON.parse(await readFile(OUT, 'utf8')); } catch { /* first run */ }

  const sources = { google, yelp, tripadvisor };
  let ran = 0;
  for (const [name, fn] of Object.entries(sources)) {
    try {
      const res = await fn();
      if (!res) { console.log(`- ${name}: skipped (no API key)`); continue; }
      ran++;
      const { snapshot, reviews } = res;
      if (snapshot.rating) {
        out.snapshots = out.snapshots.filter(s => !(s.platform === snapshot.platform && s.date === snapshot.date));
        out.snapshots.push(snapshot);
      }
      const seen = new Set(out.reviews.map(r => `${r.platform}|${r.externalId}`));
      const fresh = reviews.filter(r => r.externalId && !seen.has(`${r.platform}|${r.externalId}`));
      out.reviews.push(...fresh);
      console.log(`- ${name}: ${snapshot.rating ?? '?'}★ (${snapshot.count ?? '?'} reviews), ${fresh.length} new review(s)`);
    } catch (e) {
      console.error(`- ${name}: FAILED — ${e.message}`);
    }
  }
  if (!ran) {
    console.log('\nNo API keys set. See review-tracker/README.md for how to get them.');
    return;
  }
  out.generatedAt = new Date().toISOString();
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(out, null, 2));
  console.log(`\nWrote ${OUT}`);
}

main();
