/** Loading skeleton for results page — shown while data loads */
export default function ResultsLoading() {
  return (
    <main className="container-app py-12">
      <div className="animate-pulse space-y-6">
        {/* Header */}
        <div className="h-8 bg-gray-200 rounded w-32" />

        {/* Summary panel */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="h-4 bg-gray-200 rounded w-28 mb-4" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i}>
                <div className="h-3 bg-gray-100 rounded w-16 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
            ))}
          </div>
        </div>

        {/* Preference bar */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="h-9 bg-gray-100 rounded w-full" />
        </div>

        {/* Sort controls */}
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-100 rounded w-28" />
          ))}
        </div>

        {/* Property card skeletons */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="flex gap-4">
              <div className="h-4 bg-gray-100 rounded w-24" />
              <div className="h-4 bg-gray-100 rounded w-16" />
              <div className="h-4 bg-gray-100 rounded w-28" />
            </div>
            <div className="h-6 bg-gray-100 rounded w-32" />
          </div>
        ))}
      </div>
    </main>
  );
}
