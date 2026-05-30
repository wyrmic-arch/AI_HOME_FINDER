'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

/**
 * SearchForm — the entry point. Collects work location, salary, commute.
 * On submit: validates, then navigates to /results.
 */
export default function SearchForm() {
  const router = useRouter();
  const [workLocation, setWorkLocation] = useState('');
  const [monthlySalary, setMonthlySalary] = useState('');
  const [maxCommuteMinutes, setMaxCommuteMinutes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const trimmedLocation = workLocation.trim();
    const salary = Number(monthlySalary);
    const commute = Number(maxCommuteMinutes);

    if (!trimmedLocation) {
      setError('Please enter your work location.');
      return;
    }
    if (!monthlySalary || isNaN(salary) || salary <= 0) {
      setError('Please enter a valid monthly salary greater than 0.');
      return;
    }
    if (!maxCommuteMinutes || isNaN(commute) || commute <= 0) {
      setError('Please enter a valid commute time greater than 0.');
      return;
    }

    const params = new URLSearchParams({
      workLocation: trimmedLocation,
      salary: String(salary),
      commute: String(commute),
    });
    router.push(`/results?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-5"
    >
      {/* Work Location */}
      <div>
        <label htmlFor="workLocation" className="block text-sm font-medium text-gray-700 mb-1">
          Work Location
        </label>
        <input
          type="text"
          id="workLocation"
          value={workLocation}
          onChange={(e) => setWorkLocation(e.target.value)}
          placeholder="e.g. Sandton"
          className="w-full px-3 py-3 text-base border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-400 mt-1">
          Try: Sandton, Rosebank, Bryanston, Fourways, Midrand, Centurion, Melville, Parkhurst
        </p>
      </div>

      {/* Monthly Salary */}
      <div>
        <label htmlFor="monthlySalary" className="block text-sm font-medium text-gray-700 mb-1">
          Monthly Salary (ZAR)
        </label>
        <input
          type="number"
          id="monthlySalary"
          value={monthlySalary}
          onChange={(e) => setMonthlySalary(e.target.value)}
          placeholder="e.g. 25000"
          min="1"
          className="w-full px-3 py-3 text-base border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>

      {/* Max Commute Time */}
      <div>
        <label htmlFor="maxCommuteMinutes" className="block text-sm font-medium text-gray-700 mb-1">
          Max Commute (minutes)
        </label>
        <input
          type="number"
          id="maxCommuteMinutes"
          value={maxCommuteMinutes}
          onChange={(e) => setMaxCommuteMinutes(e.target.value)}
          placeholder="e.g. 40"
          min="1"
          className="w-full px-3 py-3 text-base border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
      >
        Search
      </button>
    </form>
  );
}
