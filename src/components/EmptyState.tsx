import Link from 'next/link';

/** EmptyState — shown when no properties match. */
export default function EmptyState() {
  return (
    <div className="text-center py-16 px-4">
      <p className="text-gray-900 text-lg font-medium mb-2">
        No properties match your criteria.
      </p>
      <p className="text-gray-500 mb-6">Try:</p>

      <ul className="inline-block text-left text-gray-600 space-y-2 mb-8">
        <li className="flex items-start gap-2">
          <span className="text-gray-400">•</span>
          <span>Increasing your commute limit</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-gray-400">•</span>
          <span>Increasing your salary</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-gray-400">•</span>
          <span>Trying a different work location (Sandton, Rosebank, Bryanston, Fourways...)</span>
        </li>
      </ul>

      <div>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-brand-600 bg-brand-50 rounded-md hover:bg-brand-100 transition-colors"
        >
          ← New Search
        </Link>
      </div>
    </div>
  );
}
