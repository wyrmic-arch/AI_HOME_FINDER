'use client';

import { useState, useMemo } from 'react';
import type { ScoredProperty } from '@/types/property';
import PropertyList from './PropertyList';

type SortKey = 'best-match' | 'lowest-rent' | 'shortest-commute';

/** PropertyListWithSorting — sort controls + property list */
export default function PropertyListWithSorting({ properties }: { properties: ScoredProperty[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('best-match');

  const sorted = useMemo(() => {
    return [...properties].sort((a, b) => {
      switch (sortKey) {
        case 'best-match':
          if (a.score !== b.score) return a.score - b.score;
          return a.monthlyRent - b.monthlyRent;
        case 'lowest-rent':
          return a.monthlyRent - b.monthlyRent;
        case 'shortest-commute':
          return a.commuteMinutes - b.commuteMinutes;
      }
    });
  }, [properties, sortKey]);

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-500">Sort by:</span>
        <div className="flex flex-wrap gap-2">
          {([
            { key: 'best-match' as const, label: 'Best Match' },
            { key: 'lowest-rent' as const, label: 'Lowest Rent' },
            { key: 'shortest-commute' as const, label: 'Shortest Commute' },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortKey(key)}
              className={`min-h-[44px] px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                sortKey === key
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <PropertyList properties={sorted} />
    </>
  );
}
