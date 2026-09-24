import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, GovernmentExam, EligibilityVerdict, ExamAlert } from './types';
import { DEFAULT_USER_PROFILE, PRESET_PROFILES } from './data/presetProfiles';
import { INITIAL_GOVERNMENT_EXAMS } from './data/mockExams';
import { evaluateExamEligibility } from './utils/eligibilityEngine';
import { Navbar } from './components/Navbar';
import { ProfileBanner } from './components/ProfileBanner';
import { StatsCounter } from './components/StatsCounter';
import { FilterBar } from './components/FilterBar';
import { ExamCard } from './components/ExamCard';
import { ExamDetailModal } from './components/ExamDetailModal';
import { ProfileEditModal } from './components/ProfileEditModal';
import { TimelineView } from './components/TimelineView';
import { SavedAndAlertsView } from './components/SavedAndAlertsView';
import { RulesExplanationView } from './components/RulesExplanationView';
import { AuditReportModal } from './components/AuditReportModal';
import { ShieldCheck, HelpCircle, ArrowUpRight } from 'lucide-react';

export default function App() {
  // 1. User Profile State (Initialized to user's prompt specifications)
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('sarkari_track_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_USER_PROFILE;
      }
    }
    return DEFAULT_USER_PROFILE;
  });

  // Save profile changes to localStorage
  useEffect(() => {
    localStorage.setItem('sarkari_track_profile', JSON.stringify(user));
  }, [user]);

  // 2. Saved Exams State
  const [savedExamIds, setSavedExamIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('sarkari_track_saved');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return ['ssc-cgl-2025', 'rrb-ntpc-graduate-2025'];
      }
    }
    return ['ssc-cgl-2025', 'rrb-ntpc-graduate-2025'];
  });

  useEffect(() => {
    localStorage.setItem('sarkari_track_saved', JSON.stringify(savedExamIds));
  }, [savedExamIds]);

  // 3. Alerts State
  const [alerts, setAlerts] = useState<ExamAlert[]>(() => {
    const saved = localStorage.getItem('sarkari_track_alerts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: 'alert-1',
        examId: 'ssc-cgl-2025',
        title: 'SSC CGL 2025 Tier 1 Exam Window',
        triggerDate: '2025-09-02',
        alertType: 'Admit Card',
        note: 'Download admit card and check exam city intimation',
        isActive: true,
        createdAt: '2025-07-01',
      },
      {
        id: 'alert-2',
        examId: 'rrb-ntpc-graduate-2025',
        title: 'RRB NTPC Graduate Application Deadline',
        triggerDate: '2024-10-17',
        alertType: 'Application Deadline',
        note: 'Complete fee payment and finalize zone selection',
        isActive: true,
        createdAt: '2024-09-15',
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('sarkari_track_alerts', JSON.stringify(alerts));
  }, [alerts]);

  // 4. Navigation & Views State
  const [activeTab, setActiveTab] = useState<'exams' | 'timeline' | 'saved' | 'rules'>('exams');
  const [activeFilter, setActiveFilter] = useState<'ALL' | EligibilityVerdict | 'SAVED' | 'CLOSING_SOON'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'closingDate' | 'salaryHigh' | 'vacancies' | 'examDate'>('closingDate');
  const [minPayFilter, setMinPayFilter] = useState<number>(user.preferences.minimumDesiredPay);

  // 5. Modals State
  const [selectedExamForDetail, setSelectedExamForDetail] = useState<GovernmentExam | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isAuditReportOpen, setIsAuditReportOpen] = useState<boolean>(false);

  // Sync minPayFilter when user preferences change
  useEffect(() => {
    setMinPayFilter(user.preferences.minimumDesiredPay);
  }, [user.preferences.minimumDesiredPay]);

  // 6. Recalculate Eligibility for All Exams on User Profile change
  const resultsMap = useMemo(() => {
    const map: Record<string, ReturnType<typeof evaluateExamEligibility>> = {};
    INITIAL_GOVERNMENT_EXAMS.forEach((exam) => {
      map[exam.id] = evaluateExamEligibility(user, exam);
    });
    return map;
  }, [user]);

  // Stats calculation
  const stats = useMemo(() => {
    let eligible = 0;
    let conditional = 0;
    let notEligible = 0;
    let excluded = 0;
    let closingSoon = 0;

    const today = new Date();

    INITIAL_GOVERNMENT_EXAMS.forEach((exam) => {
      const res = resultsMap[exam.id];
      if (!res) return;

      if (res.verdict === 'ELIGIBLE') eligible++;
      else if (res.verdict === 'CONDITIONALLY_ELIGIBLE') conditional++;
      else if (res.verdict === 'NOT_ELIGIBLE') notEligible++;
      else if (res.verdict === 'EXCLUDED') excluded++;

      const end = new Date(exam.applicationEndDate);
      const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diff > 0 && diff <= 14) {
        closingSoon++;
      }
    });

    return {
      total: INITIAL_GOVERNMENT_EXAMS.length,
      eligible,
      conditional,
      notEligible,
      excluded,
      closingSoon,
    };
  }, [resultsMap]);

  // Filtered and Sorted Exams
  const filteredExams = useMemo(() => {
    const today = new Date();

    return INITIAL_GOVERNMENT_EXAMS.filter((exam) => {
      const res = resultsMap[exam.id];
      if (!res) return false;

      // 1. Status Filter
      if (activeFilter === 'SAVED') {
        if (!savedExamIds.includes(exam.id)) return false;
      } else if (activeFilter === 'CLOSING_SOON') {
        const end = new Date(exam.applicationEndDate);
        const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diff < 0 || diff > 14) return false;
      } else if (activeFilter !== 'ALL') {
        if (res.verdict !== activeFilter) return false;
      }

      // 2. Category Sector Filter
      if (selectedCategory !== 'ALL' && exam.categoryTag !== selectedCategory) {
        return false;
      }

      // 3. Minimum Pay Filter
      if (exam.maxGrossMonthlyPay < minPayFilter) {
        return false;
      }

      // 4. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = exam.title.toLowerCase().includes(q);
        const matchesCode = exam.shortCode.toLowerCase().includes(q);
        const matchesBody = exam.conductingBody.toLowerCase().includes(q);
        const matchesPost = exam.postsList?.some((p) => p.postName.toLowerCase().includes(q));

        if (!matchesTitle && !matchesCode && !matchesBody && !matchesPost) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'closingDate') {
        return new Date(a.applicationEndDate).getTime() - new Date(b.applicationEndDate).getTime();
      }
      if (sortBy === 'salaryHigh') {
        return b.maxGrossMonthlyPay - a.maxGrossMonthlyPay;
      }
      if (sortBy === 'vacancies') {
        return b.totalVacancies - a.totalVacancies;
      }
      if (sortBy === 'examDate') {
        return a.notificationDate.localeCompare(b.notificationDate);
      }
      return 0;
    });
  }, [resultsMap, activeFilter, selectedCategory, minPayFilter, searchQuery, sortBy, savedExamIds]);

  // Handlers
  const handleToggleSave = (examId: string) => {
    setSavedExamIds((prev) =>
      prev.includes(examId) ? prev.filter((id) => id !== examId) : [...prev, examId]
    );
  };

  const handleSelectPreset = (presetId: string) => {
    const found = PRESET_PROFILES.find((p) => p.id === presetId);
    if (found) {
      setUser(JSON.parse(JSON.stringify(found.profile)));
    }
  };

  const handleAddReminder = (examId: string, alertType: any, note: string) => {
    const targetExam = INITIAL_GOVERNMENT_EXAMS.find((e) => e.id === examId);
    const newAlert: ExamAlert = {
      id: `alert-${Date.now()}`,
      examId,
      title: `${targetExam?.shortCode || 'Exam'} - ${alertType}`,
      triggerDate: targetExam?.applicationEndDate || new Date().toISOString().split('T')[0],
      alertType,
      note,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const handleDeleteAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const savedExamsList = useMemo(() => {
    return INITIAL_GOVERNMENT_EXAMS.filter((e) => savedExamIds.includes(e.id));
  }, [savedExamIds]);

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col font-sans">
      {/* 1. Header / Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenAuditReport={() => setIsAuditReportOpen(true)}
        savedCount={savedExamIds.length}
      />

      {/* 2. User Profile Summary Banner */}
      <ProfileBanner
        user={user}
        onOpenEditModal={() => setIsProfileModalOpen(true)}
        onSelectPreset={handleSelectPreset}
      />

      {/* 3. Main Workspace Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'exams' && (
          <div className="space-y-8">
            {/* Unboxed Stats Counter */}
            <StatsCounter
              totalCount={stats.total}
              eligibleCount={stats.eligible}
              conditionalCount={stats.conditional}
              notEligibleCount={stats.notEligible}
              excludedCount={stats.excluded}
              closingSoonCount={stats.closingSoon}
              activeFilter={activeFilter}
              onSelectFilter={setActiveFilter}
            />

            {/* Filter and Search Bar */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
              <FilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                sortBy={sortBy}
                onSortChange={setSortBy}
                minPayFilter={minPayFilter}
                onMinPayFilterChange={setMinPayFilter}
                totalResults={filteredExams.length}
              />
            </div>

            {/* Exam Cards Grid */}
            {filteredExams.length === 0 ? (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-16 text-center space-y-3">
                <p className="text-sm font-medium text-neutral-300">
                  No government examinations match your current filters.
                </p>
                <p className="text-xs text-neutral-500">
                  Try adjusting the salary range slider, clearing search terms, or switching status filter to "All Exams".
                </p>
                <button
                  onClick={() => {
                    setActiveFilter('ALL');
                    setSelectedCategory('ALL');
                    setSearchQuery('');
                    setMinPayFilter(18000);
                  }}
                  className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-700 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredExams.map((exam) => (
                  <ExamCard
                    key={exam.id}
                    exam={exam}
                    result={resultsMap[exam.id]}
                    isSaved={savedExamIds.includes(exam.id)}
                    onToggleSave={handleToggleSave}
                    onOpenDetails={setSelectedExamForDetail}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <TimelineView
            exams={INITIAL_GOVERNMENT_EXAMS}
            resultsMap={resultsMap}
            onOpenDetails={setSelectedExamForDetail}
          />
        )}

        {activeTab === 'saved' && (
          <SavedAndAlertsView
            savedExams={savedExamsList}
            resultsMap={resultsMap}
            alerts={alerts}
            onToggleSave={handleToggleSave}
            onDeleteAlert={handleDeleteAlert}
            onOpenDetails={setSelectedExamForDetail}
            onNavigateToExams={() => setActiveTab('exams')}
          />
        )}

        {activeTab === 'rules' && <RulesExplanationView />}
      </main>

      {/* 4. Footer */}
      <footer className="mt-auto border-t border-neutral-800 bg-neutral-950 py-8 text-neutral-500 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-300">SarkariTrack</span>
            <span aria-hidden="true">·</span>
            <span>Indian Government Exam Eligibility &amp; Alert Engine</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('rules')}
              className="hover:text-neutral-300 transition-colors"
            >
              Engine Architecture &amp; Rules
            </button>
            <button
              onClick={() => setIsAuditReportOpen(true)}
              className="hover:text-neutral-300 transition-colors"
            >
              Export Eligibility Dossier
            </button>
            <a
              href="https://ssc.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-300 transition-colors flex items-center gap-1"
            >
              <span>SSC Official</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* 5. Modals and Drawers */}
      {selectedExamForDetail && (
        <ExamDetailModal
          exam={selectedExamForDetail}
          result={resultsMap[selectedExamForDetail.id]}
          user={user}
          isOpen={true}
          onClose={() => setSelectedExamForDetail(null)}
          isSaved={savedExamIds.includes(selectedExamForDetail.id)}
          onToggleSave={handleToggleSave}
          onAddReminder={handleAddReminder}
        />
      )}

      {isProfileModalOpen && (
        <ProfileEditModal
          user={user}
          isOpen={true}
          onClose={() => setIsProfileModalOpen(false)}
          onSave={setUser}
        />
      )}

      {isAuditReportOpen && (
        <AuditReportModal
          user={user}
          exams={INITIAL_GOVERNMENT_EXAMS}
          resultsMap={resultsMap}
          isOpen={true}
          onClose={() => setIsAuditReportOpen(false)}
        />
      )}
    </div>
  );
}
