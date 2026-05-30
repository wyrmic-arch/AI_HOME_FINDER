'use client';

import { useState } from 'react';
import type { ScoredProperty } from '@/types/property';
import ScoreBadge from './ScoreBadge';
import RecommendedBadge from './RecommendedBadge';

/** PropertyCard — displays a single property with score and explainability */
export default function PropertyCard({
  property,
  rank,
}: {
  property: ScoredProperty;
  rank: number;
}) {
  const isRecommended = rank <= 3;
  const hasExplanation = property.explanation !== '';
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <li className="relative bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      <span className="absolute top-3 left-3 text-sm font-mono text-gray-400">#{rank}</span>

      {isRecommended && (
        <div className="absolute top-3 right-3">
          <RecommendedBadge />
        </div>
      )}

      <div className="mt-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{property.title}</h2>
          <p className="text-sm text-gray-500">{property.suburb}</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-1 text-sm">
          <span>
            <span className="text-gray-500">Rent:</span>{' '}
            <span className="font-semibold text-gray-900">R{property.monthlyRent.toLocaleString('en-ZA')}</span>
            <span className="text-gray-400"> / month</span>
          </span>
          <span>
            <span className="text-gray-500">Bedrooms:</span>{' '}
            <span className="font-semibold text-gray-900">{property.bedrooms}</span>
          </span>
          <span>
            <span className="text-gray-500">🚗</span>{' '}
            <span className="font-semibold text-gray-900">{property.commuteMinutes} min commute</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ScoreBadge score={property.score} />
        </div>

        {/* Explainability — collapsible */}
        {hasExplanation && (
          <div className="border-t border-gray-100 pt-3">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors w-full text-left"
            >
              <span>🧾</span>
              <span>Why this result?</span>
              <span className="text-gray-400 ml-auto text-xs">
                {showExplanation ? '▲ Collapse' : '▼ Expand'}
              </span>
            </button>
            {showExplanation && (
              <div className="mt-3 pl-6 space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <span>💰</span>
                  <span className="text-gray-600">
                    <span className="font-medium text-gray-700">Rent:</span> {property.rentLabel}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span>🚗</span>
                  <span className="text-gray-600">
                    <span className="font-medium text-gray-700">Commute:</span> {property.commuteLabel}
                  </span>
                </div>
                {property.lifestyleLabel && (
                  <div className="flex items-start gap-2 text-sm">
                    <span>🧠</span>
                    <span className="text-gray-600">
                      <span className="font-medium text-gray-700">Lifestyle:</span> {property.lifestyleLabel}
                    </span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-sm pt-1 border-t border-gray-100">
                  <span>📋</span>
                  <p className="text-gray-700 font-medium leading-relaxed">{property.explanation}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
