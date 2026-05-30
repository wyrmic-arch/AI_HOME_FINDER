'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Property, ScoredProperty, SearchInput, UserPreferences } from '@/types/property';
import { rankProperties } from '@/lib/scoring';
import ResultsSummary from '@/components/ResultsSummary';
import PropertyListWithSorting from '@/components/PropertyListWithSorting';

/**
 * ResultsPageClient — owns preference state, re-ranks on change.
 * Single ranking entry point: rankProperties().
 */

const PRESETS: Record<string, UserPreferences> = {
  'budget-focused':    { rentWeight: 0.8, commuteWeight: 0.2, lifestyleWeight: 0.0 },
  'balanced':          { rentWeight: 0.5, commuteWeight: 0.3, lifestyleWeight: 0.2 },
  'lifestyle-focused': { rentWeight: 0.3, commuteWeight: 0.3, lifestyleWeight: 0.4 },
};

interface Props {
  allProperties: Property[];
  rankedProperties: ScoredProperty[];
  searchInput: SearchInput;
  totalInDataset: number;
}

export default function ResultsPageClient({
  allProperties,
  rankedProperties,
  searchInput,
  totalInDataset,
}: Props) {
  const [preferences, setPreferences] = useState<UserPreferences | undefined>(undefined);

  const displayProperties = useMemo(() => {
    if (!preferences) return rankedProperties;
    return rankProperties(allProperties, searchInput, preferences);
  }, [allProperties, searchInput, preferences, rankedProperties]);

  const hasPreferences = preferences !== undefined;

  return (
    <>
      {/* Back to search + status */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-sm text-brand-600 hover:underline">
          ← Edit Search
        </Link>
        {hasPreferences && (
          <span className="text-xs text-gray-400">Personalized ranking active</span>
        )}
      </div>

      <ResultsSummary
        searchInput={searchInput}
        totalInDataset={totalInDataset}
        rankedProperties={displayProperties}
      />

      {/* Preference presets */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <span className="text-sm font-medium text-gray-700">Ranking priority:</span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PRESETS).map(([key, prefs]) => {
              const label =
                key === 'budget-focused' ? '💰 Budget-first' :
                key === 'balanced' ? '⚖️ Balanced' :
                '✨ Lifestyle-first';
              return (
                <button
                  key={key}
                  onClick={() => setPreferences(prefs)}
                  className="min-h-[44px] px-4 py-2 text-sm font-medium rounded-md border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition-colors"
                >
                  {label}
                </button>
              );
            })}
            {hasPreferences && (
              <button
                onClick={() => setPreferences(undefined)}
                className="min-h-[44px] px-4 py-2 text-sm font-medium rounded-md border border-gray-200 text-gray-400 bg-white hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      <PropertyListWithSorting properties={displayProperties} />
    </>
  );
}
