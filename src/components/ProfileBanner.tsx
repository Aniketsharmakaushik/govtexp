import React from 'react';
import { UserProfile } from '../types';
import { PRESET_PROFILES } from '../data/presetProfiles';
import { SlidersHorizontal, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ProfileBannerProps {
  user: UserProfile;
  onOpenEditModal: () => void;
  onSelectPreset: (presetId: string) => void;
}

export const ProfileBanner: React.FC<ProfileBannerProps> = ({
  user,
  onOpenEditModal,
  onSelectPreset,
}) => {
  const completedQuals = user.qualifications
    .filter(q => q.completionStatus === 'Completed')
    .map(q => q.streamOrBranch ? `${q.name} (${q.streamOrBranch})` : q.name);

  const pursuingQuals = user.qualifications
    .filter(q => q.completionStatus === 'Pursuing')
    .map(q => `${q.name}${q.expectedCompletionYear ? ' (Exp ' + q.expectedCompletionYear + ')' : ''}`);

  return (
    <div className="border-b border-neutral-800 bg-neutral-900/60 py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: User eligibility credentials summary */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
              <span className="font-semibold text-amber-400">Active Profile</span>
              <span aria-hidden="true">·</span>
              <span className="text-white font-medium">{user.fullName}</span>
              <span aria-hidden="true">·</span>
              <span>DOB: <span className="font-mono tabular-nums text-neutral-200">{user.dateOfBirth}</span></span>
              <span aria-hidden="true">·</span>
              <span>Category: <span className="text-neutral-200">{user.category}</span></span>
              <span aria-hidden="true">·</span>
              <span>Domicile: <span className="text-neutral-200">{user.stateOfDomicile}</span></span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-300">
              <div>
                <span className="text-neutral-400">Completed: </span>
                <span className="font-medium text-neutral-200">{completedQuals.join(' · ') || 'None'}</span>
              </div>
              {pursuingQuals.length > 0 && (
                <>
                  <span className="text-neutral-600 hidden sm:inline" aria-hidden="true">|</span>
                  <div>
                    <span className="text-amber-400/90 font-medium">Pursuing: </span>
                    <span className="text-neutral-200">{pursuingQuals.join(' · ')}</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
              <span>Min Desired Pay: <span className="font-mono tabular-nums text-neutral-200">₹{user.preferences.minimumDesiredPay.toLocaleString('en-IN')}/mo</span></span>
              <span aria-hidden="true">·</span>
              <span>
                Filters: {user.preferences.excludeMilitaryDefence ? 'Defence excluded' : 'Defence included'}
                {' · '}
                {user.preferences.excludeUPSC ? 'UPSC excluded' : 'UPSC included'}
                {' · '}
                {user.preferences.excludeCAExams ? 'CA excluded' : 'CA included'}
              </span>
            </div>
          </div>

          {/* Right: Actions and Preset Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="preset-select" className="text-xs text-neutral-400 whitespace-nowrap">
                Test Scenario:
              </label>
              <select
                id="preset-select"
                onChange={(e) => onSelectPreset(e.target.value)}
                defaultValue="user-default"
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-xs text-neutral-200 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {PRESET_PROFILES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onOpenEditModal}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:border-neutral-500 hover:bg-neutral-700 whitespace-nowrap"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-amber-400" />
              <span>Edit Qualifications & Filters</span>
            </button>
          </div>
        </div>

        {/* Verification Guarantee Note */}
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-neutral-800 bg-neutral-900/90 p-3 text-xs text-neutral-400">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400/90 mt-0.5" />
          <p>
            <strong className="text-neutral-200">Strict Official Verification Policy:</strong> SarkariTrack evaluates age on each exam's specific reference date (not today's date). Posts with special branches, typing benchmarks, or pending degree clauses are classified under <span className="text-amber-400 font-medium">⚠️ Manual Verification Required</span> with explicit instructions to inspect the official recruitment gazette.
          </p>
        </div>
      </div>
    </div>
  );
};
