import type { ScoredProperty, SearchInput } from '@/types/property';

/** ResultsSummary — shows search params + result stats */
export default function ResultsSummary({
  searchInput,
  totalInDataset,
  rankedProperties,
}: {
  searchInput: SearchInput;
  totalInDataset: number;
  rankedProperties: ScoredProperty[];
}) {
  const found = rankedProperties.length;
  const excluded = totalInDataset - found;
  const bestMatch = rankedProperties[0] ?? null;
  const averageRent = found > 0
    ? Math.round(rankedProperties.reduce((sum, p) => sum + p.monthlyRent, 0) / found)
    : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Search Summary
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Work Location</p>
          <p className="text-sm font-medium text-gray-900 truncate">{searchInput.workLocation}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Monthly Salary</p>
          <p className="text-sm font-medium text-gray-900">R{searchInput.monthlySalary.toLocaleString('en-ZA')}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Maximum Commute</p>
          <p className="text-sm font-medium text-gray-900">{searchInput.maxCommuteMinutes} min</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Properties Found</p>
          <p className="text-sm font-medium text-gray-900">
            {found} of {totalInDataset}
            {excluded > 0 && <span className="text-gray-400 font-normal"> ({excluded} excluded)</span>}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Best Match</p>
          {bestMatch ? (
            <p className="text-sm font-medium text-gray-900 truncate">
              {bestMatch.title}
              <span className="text-gray-400 font-normal ml-1">(#1)</span>
            </p>
          ) : (
            <p className="text-sm text-gray-400">&mdash;</p>
          )}
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Average Rent</p>
          <p className="text-sm font-medium text-gray-900">
            {averageRent > 0 ? `R${averageRent.toLocaleString('en-ZA')}` : '&mdash;'}
          </p>
        </div>
      </div>
    </div>
  );
}
