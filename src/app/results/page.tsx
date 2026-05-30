import { rankProperties } from '@/lib/scoring';
import { mockProperties } from '@/lib/mockProperties';
import ResultsPageClient from './ResultsPageClient';
import type { SearchInput } from '@/types/property';

/**
 * Results Page (/results)
 *
 * Server Component — reads query params, delegates to ResultsPageClient.
 * All scoring runs client-side via rankProperties().
 */
export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{
    workLocation?: string;
    salary?: string;
    commute?: string;
  }>;
}) {
  const params = await searchParams;
  const workLocation = params.workLocation ?? '';
  const salary = Number(params.salary);
  const commute = Number(params.commute);

  if (!workLocation || isNaN(salary) || isNaN(commute) || salary <= 0 || commute <= 0) {
    return (
      <main className="container-app py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Results</h1>
        <p className="text-red-600">Invalid search parameters. Please go back and fill in all fields.</p>
      </main>
    );
  }

  const searchInput: SearchInput = {
    workLocation,
    monthlySalary: salary,
    maxCommuteMinutes: commute,
  };

  // Server-side render with default (no preferences) for initial load
  const rankedProperties = rankProperties(mockProperties, searchInput);

  return (
    <main className="container-app py-12">
      <header className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Results</h1>
      </header>
      <ResultsPageClient
        allProperties={mockProperties}
        rankedProperties={rankedProperties}
        searchInput={searchInput}
        totalInDataset={mockProperties.length}
      />
    </main>
  );
}
