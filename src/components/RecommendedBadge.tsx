/*
 * RecommendedBadge — Server Component
 *
 * Visual indicator for top-3 ranked properties.
 * Expected to be used only on cards where rank <= 3.
 *
 * Styled to stand out: gold/amber background with a star emoji.
 * Positioned by the parent (PropertyCard) — this component is just the visual.
 */
export default function RecommendedBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
      ⭐ Recommended
    </span>
  );
}
