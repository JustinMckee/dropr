'use client';

import { Search, Filter } from 'lucide-react';
import {
  useSearchQuery,
  useSetQuery,
  useToggleExpanded,
  useSearchExpanded,
} from '@/features/search/hooks/useSearch';

export function SearchBar() {
  const query = useSearchQuery();
  const setQuery = useSetQuery();
  const isExpanded = useSearchExpanded();
  const toggleExpanded = useToggleExpanded();

  const handleFocus = () => {
    toggleExpanded(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6">
      <div className="relative flex items-center bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
        <Search
          className="absolute left-4 text-gray-400"
          size={20}
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Search drops, curators, categories..."
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          aria-label="Search"
          className="w-full pl-12 pr-12 py-3 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => toggleExpanded(true)}
          aria-label="Open filters"
          className="absolute right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <Filter size={20} />
        </button>
      </div>
    </div>
  );
}
