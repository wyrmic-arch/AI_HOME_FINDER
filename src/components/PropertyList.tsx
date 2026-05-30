import type { ScoredProperty } from '@/types/property';
import PropertyCard from './PropertyCard';
import EmptyState from './EmptyState';

/*
 * PropertyList — Server Component
 *
 * Renders a list of ranked property cards from a ScoredProperty array.
 * Handles the empty state gracefully with the EmptyState component.
 *
 * Each card receives a 1-indexed rank prop so it can:
 *   - Display the ranking number (#1, #2, ...)
 *   - Show the RecommendedBadge (only on #1–#3)
 */
export default function PropertyList({
  properties,
}: {
  properties: ScoredProperty[];
}) {
  if (properties.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul className="space-y-4">
      {properties.map((property, index) => (
        <PropertyCard
          key={property.id}
          property={property}
          rank={index + 1}
        />
      ))}
    </ul>
  );
}
