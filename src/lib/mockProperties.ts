import type { Property } from '@/types/property';

/**
 * Mock property dataset — 26 realistic Gauteng rental listings.
 *
 * Rent range: R4,500 – R22,000 per month
 * Commute range: 10 – 90 minutes (proxy: time to Sandton CBD)
 * All coordinates are WGS84 for the Gauteng region.
 *
 * NOTE: This file is consumed by propertyService.ts, not imported directly
 * by components or pages. When switching to a real API, update
 * propertyService.ts only — no other files need to change.
 */
export const mockProperties: Property[] = [
  /* ----------------------------- Sandton (5 properties) ----------------------------- */
  {
    id: 1,
    title: 'Executive 2BR Apartment in Banking District',
    suburb: 'Sandton',
    monthlyRent: 15_500,
    commuteMinutes: 5,
    bedrooms: 2,
    latitude: -26.1076,
    longitude: 28.0567,
  },
  {
    id: 2,
    title: 'Luxury Studio with City Views',
    suburb: 'Sandton',
    monthlyRent: 22_000,
    commuteMinutes: 5,
    bedrooms: 1,
    latitude: -26.1102,
    longitude: 28.0518,
  },
  {
    id: 3,
    title: 'Ground Floor 1BR in Secure Complex',
    suburb: 'Sandton',
    monthlyRent: 11_000,
    commuteMinutes: 8,
    bedrooms: 1,
    latitude: -26.1045,
    longitude: 28.0623,
  },
  {
    id: 4,
    title: 'Spacious 3BR Penthouse',
    suburb: 'Sandton',
    monthlyRent: 20_000,
    commuteMinutes: 5,
    bedrooms: 3,
    latitude: -26.1090,
    longitude: 28.0580,
  },
  {
    id: 5,
    title: 'Modern 2BR Near Sandton City',
    suburb: 'Sandton',
    monthlyRent: 13_500,
    commuteMinutes: 7,
    bedrooms: 2,
    latitude: -26.1060,
    longitude: 28.0545,
  },

  /* ----------------------------- Rosebank (3 properties) ----------------------------- */
  {
    id: 6,
    title: 'Spacious 2BR Close to Gautrain',
    suburb: 'Rosebank',
    monthlyRent: 12_500,
    commuteMinutes: 15,
    bedrooms: 2,
    latitude: -26.1450,
    longitude: 28.0416,
  },
  {
    id: 7,
    title: 'Trendy 1BR with City Views',
    suburb: 'Rosebank',
    monthlyRent: 9_800,
    commuteMinutes: 18,
    bedrooms: 1,
    latitude: -26.1476,
    longitude: 28.0382,
  },
  {
    id: 8,
    title: 'Renovated Studio in Art District',
    suburb: 'Rosebank',
    monthlyRent: 8_200,
    commuteMinutes: 20,
    bedrooms: 1,
    latitude: -26.1435,
    longitude: 28.0440,
  },

  /* ----------------------------- Bryanston (2 properties) ----------------------------- */
  {
    id: 9,
    title: 'Family Home with Garden',
    suburb: 'Bryanston',
    monthlyRent: 18_000,
    commuteMinutes: 20,
    bedrooms: 3,
    latitude: -26.0696,
    longitude: 28.0299,
  },
  {
    id: 10,
    title: 'Modern 1BR Apartment',
    suburb: 'Bryanston',
    monthlyRent: 11_500,
    commuteMinutes: 18,
    bedrooms: 1,
    latitude: -26.0748,
    longitude: 28.0347,
  },

  /* ----------------------------- Fourways (3 properties) ----------------------------- */
  {
    id: 11,
    title: 'Secure 2BR Complex',
    suburb: 'Fourways',
    monthlyRent: 13_000,
    commuteMinutes: 25,
    bedrooms: 2,
    latitude: -26.0205,
    longitude: 28.0104,
  },
  {
    id: 12,
    title: 'Ground Floor Unit',
    suburb: 'Fourways',
    monthlyRent: 9_500,
    commuteMinutes: 28,
    bedrooms: 2,
    latitude: -26.0247,
    longitude: 28.0149,
  },
  {
    id: 13,
    title: 'Affordable 1BR Starter',
    suburb: 'Fourways',
    monthlyRent: 7_800,
    commuteMinutes: 30,
    bedrooms: 1,
    latitude: -26.0180,
    longitude: 28.0085,
  },

  /* ----------------------------- Midrand (2 properties) ----------------------------- */
  {
    id: 14,
    title: 'Contemporary 2BR Near Highway',
    suburb: 'Midrand',
    monthlyRent: 10_500,
    commuteMinutes: 35,
    bedrooms: 2,
    latitude: -25.9802,
    longitude: 28.1307,
  },
  {
    id: 15,
    title: 'Affordable Studio',
    suburb: 'Midrand',
    monthlyRent: 7_200,
    commuteMinutes: 38,
    bedrooms: 1,
    latitude: -25.9845,
    longitude: 28.1280,
  },

  /* ----------------------------- Centurion (2 properties) ----------------------------- */
  {
    id: 16,
    title: 'Modern 2BR Near Gautrain',
    suburb: 'Centurion',
    monthlyRent: 9_000,
    commuteMinutes: 40,
    bedrooms: 2,
    latitude: -25.8604,
    longitude: 28.1802,
  },
  {
    id: 17,
    title: '3BR House with Yard',
    suburb: 'Centurion',
    monthlyRent: 12_000,
    commuteMinutes: 45,
    bedrooms: 3,
    latitude: -25.8652,
    longitude: 28.1752,
  },

  /* ----------------------------- Randburg (2 properties) ----------------------------- */
  {
    id: 18,
    title: 'Boutique 1BR',
    suburb: 'Randburg',
    monthlyRent: 8_500,
    commuteMinutes: 30,
    bedrooms: 1,
    latitude: -26.0936,
    longitude: 27.9842,
  },
  {
    id: 19,
    title: 'Renovated 2BR Duplex',
    suburb: 'Randburg',
    monthlyRent: 11_000,
    commuteMinutes: 32,
    bedrooms: 2,
    latitude: -26.0980,
    longitude: 27.9803,
  },

  /* ----------------------------- Bedfordview (1 property) ----------------------------- */
  {
    id: 20,
    title: 'Leafy Suburb Family Home',
    suburb: 'Bedfordview',
    monthlyRent: 14_000,
    commuteMinutes: 28,
    bedrooms: 3,
    latitude: -26.1734,
    longitude: 28.1482,
  },

  /* ----------------------------- Melville (2 properties) ----------------------------- */
  {
    id: 21,
    title: 'Cosy Studio Walking Distance to 7th Street',
    suburb: 'Melville',
    monthlyRent: 7_500,
    commuteMinutes: 22,
    bedrooms: 1,
    latitude: -26.1746,
    longitude: 28.0038,
  },
  {
    id: 22,
    title: 'Heritage 2BR with Character',
    suburb: 'Melville',
    monthlyRent: 9_800,
    commuteMinutes: 24,
    bedrooms: 2,
    latitude: -26.1778,
    longitude: 28.0084,
  },

  /* ----------------------------- Hatfield (2 properties) ----------------------------- */
  {
    id: 23,
    title: 'Student-Style Flat Near University',
    suburb: 'Hatfield',
    monthlyRent: 5_500,
    commuteMinutes: 50,
    bedrooms: 1,
    latitude: -25.7442,
    longitude: 28.2410,
  },
  {
    id: 24,
    title: 'Secure 2BR Complex',
    suburb: 'Hatfield',
    monthlyRent: 8_000,
    commuteMinutes: 52,
    bedrooms: 2,
    latitude: -25.7478,
    longitude: 28.2375,
  },

  /* ----------------------------- Pretoria CBD (1 property) ----------------------------- */
  {
    id: 25,
    title: 'Budget Inner City Studio',
    suburb: 'Pretoria CBD',
    monthlyRent: 4_800,
    commuteMinutes: 55,
    bedrooms: 1,
    latitude: -25.7469,
    longitude: 28.1832,
  },

  /* ----------------------------- Roodepoort (1 property) ----------------------------- */
  {
    id: 26,
    title: 'Budget-Friendly Ground Floor Unit',
    suburb: 'Roodepoort',
    monthlyRent: 5_800,
    commuteMinutes: 55,
    bedrooms: 1,
    latitude: -26.1203,
    longitude: 27.8701,
  },

  /* ----------------------------- Edenvale (2 properties) ----------------------------- */
  {
    id: 27,
    title: 'Compact 1BR with Balcony',
    suburb: 'Edenvale',
    monthlyRent: 7_800,
    commuteMinutes: 30,
    bedrooms: 1,
    latitude: -26.1297,
    longitude: 28.1600,
  },
  {
    id: 28,
    title: 'Spacious 2BR Near Shopping Centre',
    suburb: 'Edenvale',
    monthlyRent: 10_500,
    commuteMinutes: 32,
    bedrooms: 2,
    latitude: -26.1346,
    longitude: 28.1582,
  },

  /* ----------------------------- Parkhurst (2 properties) ----------------------------- */
  {
    id: 29,
    title: 'Lock Up and Go in Trendy Village',
    suburb: 'Parkhurst',
    monthlyRent: 14_500,
    commuteMinutes: 12,
    bedrooms: 2,
    latitude: -26.1382,
    longitude: 28.0204,
  },
  {
    id: 30,
    title: 'Quiet 1BR Courtyard Apartment',
    suburb: 'Parkhurst',
    monthlyRent: 10_000,
    commuteMinutes: 14,
    bedrooms: 1,
    latitude: -26.1398,
    longitude: 28.0175,
  },

  /* ----------------------------- Sandhurst (1 property) ----------------------------- */
  {
    id: 31,
    title: 'Ultra-Luxury Penthouse',
    suburb: 'Sandhurst',
    monthlyRent: 22_000,
    commuteMinutes: 8,
    bedrooms: 3,
    latitude: -26.1064,
    longitude: 28.0580,
  },
];
