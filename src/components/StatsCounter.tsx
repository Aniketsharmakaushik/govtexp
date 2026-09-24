import React from 'react';
import { EligibilityVerdict } from '../types';

interface StatsCounterProps {
  totalCount: number;
  eligibleCount: number;
  conditionalCount: number;
  notEligibleCount: number;
  excludedCount: number;
  closingSoonCount: number;
  activeFilter: 'ALL' | EligibilityVerdict | 'SAVED' | 'CLOSING_SOON';
  onSelectFilter: (filter: 'ALL' | EligibilityVerdict | 'SAVED' | 'CLOSING_SOON') => void;
}

export const StatsCounter: React.FC<StatsCounterProps> = ({
  totalCount,
  eligibleCount,
  conditionalCount,
  notEligibleCount,
  excludedCount,
  closingSoonCount,
  activeFilter,
  onSelectFilter,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {/* 1. Eligible */}
      <button
        type="button"
        onClick={() => onSelectFilter('ELIGIBLE')}
        className={`flex flex-col rounded-lg border p-4 text-left transition-all ${
          activeFilter === 'ELIGIBLE'
            ? 'border-emerald-500 bg-emerald-950/30'
            : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
        }`}
      >
        <span className="text-xs font-medium text-neutral-400">Strictly Eligible</span>
        <span className="mt-1 font-mono text-2xl font-bold tracking-tight text-emerald-400 tabular-nums">
          {eligibleCount}
        </span>
        <span className="mt-1 text-[11px] text-neutral-400">
          Age &amp; qualifications met
        </span>
      </button>

      {/* 2. Manual Verification Required */}
      <button
        type="button"
        onClick={() => onSelectFilter('CONDITIONALLY_ELIGIBLE')}
        className={`flex flex-col rounded-lg border p-4 text-left transition-all ${
          activeFilter === 'CONDITIONALLY_ELIGIBLE'
            ? 'border-amber-500 bg-amber-950/30'
            : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
        }`}
      >
        <span className="text-xs font-medium text-neutral-400">Manual Verification</span>
        <span className="mt-1 font-mono text-2xl font-bold tracking-tight text-amber-400 tabular-nums">
          {conditionalCount}
        </span>
        <span className="mt-1 text-[11px] text-neutral-400">
          Skill / post-specific checks
        </span>
      </button>

      {/* 3. Not Eligible */}
      <button
        type="button"
        onClick={() => onSelectFilter('NOT_ELIGIBLE')}
        className={`flex flex-col rounded-lg border p-4 text-left transition-all ${
          activeFilter === 'NOT_ELIGIBLE'
            ? 'border-rose-500 bg-rose-950/30'
            : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
        }`}
      >
        <span className="text-xs font-medium text-neutral-400">Not Eligible</span>
        <span className="mt-1 font-mono text-2xl font-bold tracking-tight text-rose-400 tabular-nums">
          {notEligibleCount}
        </span>
        <span className="mt-1 text-[11px] text-neutral-400">
          Age cutoff / degree mismatch
        </span>
      </button>

      {/* 4. Excluded by Preferences */}
      <button
        type="button"
        onClick={() => onSelectFilter('EXCLUDED')}
        className={`flex flex-col rounded-lg border p-4 text-left transition-all ${
          activeFilter === 'EXCLUDED'
            ? 'border-neutral-600 bg-neutral-800/60'
            : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
        }`}
      >
        <span className="text-xs font-medium text-neutral-400">Excluded</span>
        <span className="mt-1 font-mono text-2xl font-bold tracking-tight text-neutral-400 tabular-nums">
          {excludedCount}
        </span>
        <span className="mt-1 text-[11px] text-neutral-400">
          Filtered by salary / category
        </span>
      </button>

      {/* 5. Closing Soon */}
      <button
        type="button"
        onClick={() => onSelectFilter('CLOSING_SOON')}
        className={`col-span-2 sm:col-span-1 flex flex-col rounded-lg border p-4 text-left transition-all ${
          activeFilter === 'CLOSING_SOON'
            ? 'border-amber-400 bg-amber-950/20'
            : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
        }`}
      >
        <span className="text-xs font-medium text-neutral-400">Closing Soon</span>
        <span className="mt-1 font-mono text-2xl font-bold tracking-tight text-amber-300 tabular-nums">
          {closingSoonCount}
        </span>
        <span className="mt-1 text-[11px] text-neutral-400">
          Apply within 14 days
        </span>
      </button>
    </div>
  );
};
