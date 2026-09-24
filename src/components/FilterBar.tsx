import React from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { EligibilityVerdict } from '../types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeFilter: 'ALL' | EligibilityVerdict | 'SAVED' | 'CLOSING_SOON';
  onFilterChange: (f: 'ALL' | EligibilityVerdict | 'SAVED' | 'CLOSING_SOON') => void;
  selectedCategory: string;
  onCategoryChange: (c: string) => void;
  sortBy: 'closingDate' | 'salaryHigh' | 'vacancies' | 'examDate';
  onSortChange: (s: 'closingDate' | 'salaryHigh' | 'vacancies' | 'examDate') => void;
  minPayFilter: number;
  onMinPayFilterChange: (val: number) => void;
  totalResults: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  minPayFilter,
  onMinPayFilterChange,
  totalResults,
}) => {
  const categories = [
    { id: 'ALL', label: 'All Sectors' },
    { id: 'Civilian Central', label: 'Civilian Central' },
    { id: 'Railways', label: 'Railways' },
    { id: 'Banking & Insurance', label: 'Banking' },
    { id: 'Technical & Research', label: 'Technical' },
    { id: 'State Civil / PSC', label: 'State PSC' },
    { id: 'Judicial & Courts', label: 'Judicial' },
    { id: 'Defence & Police', label: 'Defence/Police' },
    { id: 'UPSC', label: 'UPSC' },
  ];

  return (
    <div className="space-y-4">
      {/* Top row: Search bar & Sort selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by exam title, conducting body (e.g. SSC, RRB, SBI), or post..."
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900/80 py-2 pl-9 pr-4 text-xs text-neutral-200 placeholder-neutral-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="sort-by" className="flex items-center gap-1 text-xs text-neutral-400 whitespace-nowrap">
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>Sort:</span>
          </label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="rounded-lg border border-neutral-800 bg-neutral-900 py-1.5 pl-2.5 pr-8 text-xs text-neutral-200 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="closingDate">Application Deadline (Urgent First)</option>
            <option value="salaryHigh">Monthly Pay (Highest First)</option>
            <option value="vacancies">Total Vacancies (Most First)</option>
            <option value="examDate">Exam Schedule (Chronological)</option>
          </select>
        </div>
      </div>

      {/* Middle row: Segmented Status Controls */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs font-medium no-scrollbar">
        <button
          type="button"
          onClick={() => onFilterChange('ALL')}
          className={`rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap ${
            activeFilter === 'ALL'
              ? 'bg-neutral-800 text-white font-semibold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          All Exams
        </button>
        <button
          type="button"
          onClick={() => onFilterChange('ELIGIBLE')}
          className={`rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap ${
            activeFilter === 'ELIGIBLE'
              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800 font-semibold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Strictly Eligible
        </button>
        <button
          type="button"
          onClick={() => onFilterChange('CONDITIONALLY_ELIGIBLE')}
          className={`rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap ${
            activeFilter === 'CONDITIONALLY_ELIGIBLE'
              ? 'bg-amber-950/60 text-amber-400 border border-amber-800 font-semibold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          ⚠️ Manual Verification
        </button>
        <button
          type="button"
          onClick={() => onFilterChange('NOT_ELIGIBLE')}
          className={`rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap ${
            activeFilter === 'NOT_ELIGIBLE'
              ? 'bg-rose-950/60 text-rose-400 border border-rose-800 font-semibold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Not Eligible
        </button>
        <button
          type="button"
          onClick={() => onFilterChange('EXCLUDED')}
          className={`rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap ${
            activeFilter === 'EXCLUDED'
              ? 'bg-neutral-800 text-neutral-300 font-semibold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Excluded by Filters
        </button>
        <button
          type="button"
          onClick={() => onFilterChange('SAVED')}
          className={`rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap ${
            activeFilter === 'SAVED'
              ? 'bg-amber-950/60 text-amber-300 border border-amber-700 font-semibold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Saved Bookmarks
        </button>
      </div>

      {/* Bottom row: Category selector & Salary range bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800/80 pt-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-neutral-400 shrink-0">Sector:</span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className={`rounded px-2 py-1 transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-neutral-800 text-amber-400 font-medium'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 whitespace-nowrap">Min Gross Pay:</span>
            <span className="font-mono text-neutral-200 tabular-nums font-medium">
              ₹{minPayFilter.toLocaleString('en-IN')}/mo
            </span>
            <input
              type="range"
              min="18000"
              max="70000"
              step="1000"
              value={minPayFilter}
              onChange={(e) => onMinPayFilterChange(Number(e.target.value))}
              className="h-1.5 w-24 cursor-pointer appearance-none rounded-lg bg-neutral-700 accent-amber-500"
            />
          </div>

          <div className="text-neutral-400 font-mono tabular-nums whitespace-nowrap">
            Showing {totalResults} exams
          </div>
        </div>
      </div>
    </div>
  );
};
