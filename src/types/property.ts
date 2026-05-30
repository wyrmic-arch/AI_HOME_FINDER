/** Core property listing — raw data from source */
export interface Property {
  id: number;
  title: string;
  suburb: string;
  monthlyRent: number;
  commuteMinutes: number;
  bedrooms: number;
  latitude: number;
  longitude: number;
}

/** Property after scoring — what the UI reads */
export interface ScoredProperty extends Property {
  /** Rent-to-income ratio (0–0.5 after filter) */
  rentRatio: number;
  /** Commute as fraction of max commute (0–1+) */
  commuteRatio: number;
  /** Affordability score — lower is better */
  score: number;
  /** AI lifestyle bonus — lower is better */
  lifestyleScore: number;
  /** Preference-adjusted final score — lower is better */
  finalScore: number;
  /** Whether user preferences modified the ranking */
  userAdjusted: boolean;
  /** Human-readable rent assessment */
  rentLabel: string;
  /** Human-readable commute assessment */
  commuteLabel: string;
  /** Human-readable lifestyle assessment */
  lifestyleLabel: string;
  /** One-line explanation summary */
  explanation: string;
}

/** User search form input */
export interface SearchInput {
  workLocation: string;
  monthlySalary: number;
  maxCommuteMinutes: number;
}

/** User preference weights for ranking */
export interface UserPreferences {
  rentWeight: number;
  commuteWeight: number;
  lifestyleWeight: number;
}
