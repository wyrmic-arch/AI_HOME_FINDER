# AI Home Finder

## Overview

An AI-powered housing and commute optimization platform built for the South African market. Helps users find affordable rental properties near their workplace using smart scoring and ranking.

**Live URL:** `/` — Home page with search form
**Results:** `/results` — Ranked property listings

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **Data:** Static mock dataset (V1), API-ready architecture

## Setup

```bash
cd ai-home-finder
pnpm install
pnpm dev
```

Open `http://localhost:3000`

## Project Structure

```
src/
├── app/              # Next.js pages (App Router)
├── components/       # Reusable UI components
├── lib/              # Pure utility functions and mock data
├── services/         # Integration layer (APIs, ML, external data)
└── types/            # TypeScript interfaces
```

## Version Roadmap

### V1 (MVP — current)
- Property search by work location, salary, commute tolerance
- Hard affordability filter (rent ≤ 50% of salary)
- Composite affordability scoring (rent + commute)
- Top 3 "Recommended" badges
- South African property dataset (26 properties, Gauteng)

### V2 (Next)
- Geocoding for work location (text → coordinates)
- Real commute calculations (Google Maps / OSRM API)
- Transport cost estimation (fuel, Gautrain fares)
- Map integration (OpenStreetMap / Leaflet)
- User accounts and saved searches

### V3 (AI Layer)
- ML-based property recommendations trained on user behavior
- Lifestyle and community scoring
- Natural language search
- Explainable recommendations ("Why this property?")
- Proactive notifications for matching listings
