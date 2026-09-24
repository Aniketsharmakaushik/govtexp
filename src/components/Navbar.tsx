import React from 'react';
import { UserProfile } from '../types';
import { Bell, ShieldCheck, User } from 'lucide-react';

interface NavbarProps {
  activeTab: 'exams' | 'timeline' | 'saved' | 'rules';
  setActiveTab: (tab: 'exams' | 'timeline' | 'saved' | 'rules') => void;
  user: UserProfile;
  onOpenProfileModal: () => void;
  onOpenAuditReport: () => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenProfileModal,
  onOpenAuditReport,
  savedCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-900/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-700 bg-neutral-800">
            <img
              src="/src/assets/images/sarkari_track_emblem_1790250864671.jpg"
              alt="SarkariTrack Seal"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // styled SVG fallback
                e.currentTarget.style.display = 'none';
              }}
            />
            <ShieldCheck className="h-5 w-5 text-amber-500 fallback-icon" style={{ display: 'none' }} />
          </div>
          <button
            onClick={() => setActiveTab('exams')}
            className="text-left text-lg font-bold tracking-tight text-white transition-colors hover:text-amber-400"
          >
            SarkariTrack
          </button>
        </div>

        {/* Zone 2: Clean 4-6 text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
          <button
            onClick={() => setActiveTab('exams')}
            className={`transition-colors hover:text-white whitespace-nowrap ${
              activeTab === 'exams' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Exams & Eligibility
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`transition-colors hover:text-white whitespace-nowrap ${
              activeTab === 'timeline' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Schedule & Deadlines
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`transition-colors hover:text-white whitespace-nowrap relative ${
              activeTab === 'saved' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Saved & Alerts
            {savedCount > 0 && (
              <span className="ml-1.5 font-mono text-xs text-amber-400 tabular-nums">
                ({savedCount})
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`transition-colors hover:text-white whitespace-nowrap ${
              activeTab === 'rules' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Eligibility Engine Rules
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAuditReport}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800/80 px-3 py-1.5 text-xs font-medium text-neutral-200 transition-colors hover:border-neutral-600 hover:bg-neutral-800 whitespace-nowrap"
          >
            <span>Eligibility Summary</span>
          </button>

          <button
            onClick={onOpenProfileModal}
            className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/90 py-1.5 pl-2 pr-3 text-xs font-medium text-neutral-200 transition-colors hover:border-amber-500/50 hover:bg-neutral-800 whitespace-nowrap"
            title="Click to view & edit your personal eligibility profile"
          >
            <div className="relative h-6 w-6 overflow-hidden rounded-full border border-neutral-600 bg-neutral-700">
              <img
                src="/src/assets/images/user_avatar_student_1790250880332.jpg"
                alt={user.fullName}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <User className="h-4 w-4 m-1 text-neutral-300" />
            </div>
            <div className="text-left">
              <div className="text-neutral-100 font-medium leading-none">{user.fullName.split(' ')[0]}</div>
              <div className="text-[10px] text-neutral-400 leading-tight">DOB: 12-Jun-2006 · {user.category}</div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
