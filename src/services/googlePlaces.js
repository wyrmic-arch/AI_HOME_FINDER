const db = require('../db');
require('dotenv').config();

/**
 * Fetch rating and review_count from Google Places API (Place Details endpoint)
 * If no API key is present, or error occurs, return null or mock details for safe handling.
 */
async function fetchGooglePlaceDetails(placeId) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey || !placeId) {
    console.log(`Skipping Google Places API fetch. Missing API key or place ID.`);
    return null;
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=rating,user_ratings_total&key=${encodeURIComponent(apiKey)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();

    if (data.status === 'OK' && data.result) {
      return {
        rating: data.result.rating || 0.0,
        reviewCount: data.result.user_ratings_total || 0,
      };
    } else {
      throw new Error(`Google API status: ${data.status}. Error message: ${data.error_message || 'None'}`);
    }
  } catch (error) {
    console.error(`Error fetching Google Places API details for ${placeId}:`, error);
    return null;
  }
}

/**
 * Record a single client snapshot in google_reviews_logs
 */
async function snapshotClientGoogleReviews(client) {
  if (!client.google_place_id) return null;

  const details = await fetchGooglePlaceDetails(client.google_place_id);
  if (!details) return null;

  try {
    const insert = db.prepare(`
      INSERT INTO google_reviews_logs (client_id, rating, review_count)
      VALUES (?, ?, ?)
    `);
    insert.run(client.id, details.rating, details.reviewCount);
    console.log(`Recorded daily reviews snapshot for client ${client.name}: ${details.rating}⭐, ${details.reviewCount} reviews.`);
    return details;
  } catch (err) {
    console.error(`Failed to store Google reviews snapshot for client ${client.name}:`, err);
    return null;
  }
}

/**
 * Perform reviews snapshot for all active clients
 */
async function runDailyReviewsSnapshot() {
  console.log(`Starting daily Google reviews snapshots...`);
  const activeClients = db.prepare('SELECT * FROM clients WHERE active = 1 AND google_place_id IS NOT NULL AND google_place_id != ""').all();

  for (const client of activeClients) {
    await snapshotClientGoogleReviews(client);
  }
  console.log(`Finished daily Google reviews snapshots.`);
}

module.exports = {
  fetchGooglePlaceDetails,
  snapshotClientGoogleReviews,
  runDailyReviewsSnapshot,
};
