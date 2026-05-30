import SearchForm from '@/components/SearchForm';

/**
 * Home Page (/)
 *
 * Landing page with a hero section and the search form.
 * The entire above-the-fold experience should communicate:
 *   1. What this app does (find affordable housing near your workplace)
 *   2. How to use it (fill in the form)
 *
 * No navigation header in V1 — keeps the focus on the single call to action.
 */
export default function HomePage() {
  return (
    <main className="container-app">
      {/* Hero section — centered, generous vertical spacing */}
      <section className="py-20 sm:py-28 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-4">
          AI Home Finder
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
          Find affordable housing near your workplace — powered by smart matching for the
          South African market.
        </p>
      </section>

      {/* Search form — the primary and only call to action on this page */}
      <section className="pb-16 sm:pb-24">
        <SearchForm />
      </section>
    </main>
  );
}
