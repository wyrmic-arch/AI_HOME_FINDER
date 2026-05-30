import type { Property, ScoredProperty, SearchInput, UserPreferences } from '@/types/property';

/**
 * Scoring — single pipeline: filter → score → sort.
 *
 * No domain objects. No service wrappers. No intermediate types.
 * One function in, one sorted array out.
 */

// ── Affordability filter ──────────────────────────────────────────────────

const MAX_RENT_RATIO = 0.5;

function isAffordable(property: Property, salary: number): boolean {
  return property.monthlyRent <= salary * MAX_RENT_RATIO;
}

// ── Score calculation ─────────────────────────────────────────────────────

const PREMIUM_SUBURBS = new Set([
  'sandton', 'rosebank', 'melville', 'parkhurst', 'sandhurst',
]);

/**
 * Lifestyle bonus heuristic — rewards premium suburbs, 1-2 bedrooms,
 * and mid-range rent. Returns 0–0.2. This is NOT machine learning.
 */
function lifestyleBonus(property: Property, salary: number): number {
  let bonus = 0;
  if (PREMIUM_SUBURBS.has(property.suburb.toLowerCase())) bonus += 0.08;
  if (property.bedrooms >= 1 && property.bedrooms <= 2) bonus += 0.06;
  const ratio = property.monthlyRent / salary;
  if (ratio >= 0.25 && ratio <= 0.40) bonus += 0.06;
  return Math.min(bonus, 0.2);
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/**
 * Calculate the composite score for a single property.
 * Lower score = better match.
 */
function calculateScore(
  property: Property,
  salary: number,
  maxCommute: number,
  preferences?: UserPreferences,
): { score: number; lifestyleScore: number } {
  const rentRatio = property.monthlyRent / salary;
  const commuteRatio = property.commuteMinutes / maxCommute;
  const lifestyle = lifestyleBonus(property, salary);

  // Base affordability score (always computed)
  const baseScore = rentRatio * 0.6 + commuteRatio * 0.4;

  // Preference-adjusted score
  const w = preferences;
  const score = w
    ? clamp01(baseScore * w.rentWeight + commuteRatio * w.commuteWeight + lifestyle * w.lifestyleWeight)
    : baseScore;

  return { score: Math.round(score * 1000) / 1000, lifestyleScore: lifestyle };
}

// ── Explainability ────────────────────────────────────────────────────────

function rentLabel(rentRatio: number): string {
  if (rentRatio <= 0.25) return 'Excellent rent-to-income ratio';
  if (rentRatio <= 0.40) return 'Moderate rent pressure';
  return 'High rent relative to income';
}

function commuteLabel(commuteRatio: number): string {
  if (commuteRatio <= 0.30) return 'Short commute';
  if (commuteRatio <= 0.60) return 'Moderate commute';
  return 'Long commute';
}

function lifestyleLabel(lifestyleScore: number): string {
  if (lifestyleScore >= 0.14) return 'Strong lifestyle match';
  if (lifestyleScore >= 0.08) return 'Balanced lifestyle fit';
  return 'Lower lifestyle alignment';
}

function explain(rentRatio: number, commuteRatio: number): string {
  const r = rentLabel(rentRatio).toLowerCase();
  const c = commuteLabel(commuteRatio).toLowerCase();
  if (r.includes('excellent') && c.includes('short')) return 'Affordable rent and a short commute make this a top choice.';
  if (r.includes('excellent') && c.includes('moderate')) return 'Great rent with a manageable commute makes this a strong option.';
  if (r.includes('excellent') && c.includes('long')) return 'Very affordable rent, but the longer commute is a trade-off.';
  if (r.includes('moderate') && c.includes('long')) return 'Decent rent, but the long commute reduces the overall appeal.';
  if (r.includes('high') && c.includes('short')) return 'Higher rent is offset by a very short commute.';
  if (r.includes('high') && c.includes('moderate')) return 'Higher rent with a moderate commute — consider if the location justifies it.';
  if (r.includes('moderate') && c.includes('moderate')) return 'Balanced rent and commute make this a solid middle-ground option.';
  if (r.includes('high') && c.includes('long')) return 'Higher rent and a long commute make this a stretch option.';
  return `${rentLabel(rentRatio)} with a ${c} makes this a balanced option.`;
}

// ── Single entry point ────────────────────────────────────────────────────

/**
 * rankProperties — the ONLY function that produces a ranked property list.
 *
 * Pipeline: filter → score → sort
 *
 * @param properties  - Raw property list
 * @param searchInput - User's search criteria
 * @param preferences - Optional preference weights
 * @returns Ranked ScoredProperty array, best match first
 */
export function rankProperties(
  properties: Property[],
  searchInput: SearchInput,
  preferences?: UserPreferences,
): ScoredProperty[] {
  const { monthlySalary: salary, maxCommuteMinutes: maxCommute } = searchInput;

  return properties
    // 1. Filter: rent must be ≤ 50% of salary
    .filter((p) => isAffordable(p, salary))
    // 2. Score: calculate composite score + explainability
    .map((p) => {
      const { score, lifestyleScore } = calculateScore(p, salary, maxCommute, preferences);
      const rentRatio = p.monthlyRent / salary;
      const commuteRatio = p.commuteMinutes / maxCommute;
      return {
        ...p,
        rentRatio,
        commuteRatio,
        score,
        lifestyleScore,
        finalScore: preferences ? score : score, // same as score; kept for UI compatibility
        userAdjusted: !!preferences,
        rentLabel: rentLabel(rentRatio),
        commuteLabel: commuteLabel(commuteRatio),
        lifestyleLabel: lifestyleLabel(lifestyleScore),
        explanation: explain(rentRatio, commuteRatio),
      };
    })
    // 3. Sort: best score first, tie-break by lower rent
    .sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      return a.monthlyRent - b.monthlyRent;
    });
}
