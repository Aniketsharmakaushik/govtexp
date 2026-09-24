import React, { useState } from 'react';
import { GovernmentExam, EligibilityResult } from '../types';
import { Calendar, Clock, AlertCircle, ExternalLink, CheckCircle } from 'lucide-react';

interface TimelineViewProps {
  exams: GovernmentExam[];
  resultsMap: Record<string, EligibilityResult>;
  onOpenDetails: (exam: GovernmentExam) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  exams,
  resultsMap,
  onOpenDetails,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'eligible' | 'deadlines'>('all');

  const today = new Date();

  // Build timeline events
  interface TimelineEvent {
    id: string;
    exam: GovernmentExam;
    result: EligibilityResult;
    title: string;
    dateStr: string;
    dateObj: Date;
    eventType: 'Application Deadline' | 'Application Start' | 'Exam Schedule' | 'Admit Card';
    isUrgent: boolean;
    isPast: boolean;
  }

  const events: TimelineEvent[] = [];

  exams.forEach((exam) => {
    const result = resultsMap[exam.id];
    if (!result) return;

    if (filterMode === 'eligible' && result.verdict !== 'ELIGIBLE' && result.verdict !== 'CONDITIONALLY_ELIGIBLE') {
      return;
    }

    // 1. Application Deadline
    const deadlineObj = new Date(exam.applicationEndDate);
    const deadlineDiffDays = Math.ceil((deadlineObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    events.push({
      id: `${exam.id}-deadline`,
      exam,
      result,
      title: `${exam.shortCode} Application Window Closes`,
      dateStr: exam.applicationEndDate,
      dateObj: deadlineObj,
      eventType: 'Application Deadline',
      isUrgent: deadlineDiffDays > 0 && deadlineDiffDays <= 14,
      isPast: deadlineDiffDays < 0,
    });

    if (filterMode !== 'deadlines') {
      // 2. Exam Date if specific
      const examDateObj = new Date(exam.examDate.includes('-') ? exam.examDate.split(' ')[0] : '2025-10-01');
      events.push({
        id: `${exam.id}-exam`,
        exam,
        result,
        title: `${exam.shortCode} Scheduled Examination`,
        dateStr: exam.examDate,
        dateObj: examDateObj,
        eventType: 'Exam Schedule',
        isUrgent: false,
        isPast: false,
      });

      // 3. Admit Card Date if available
      if (exam.admitCardDate) {
        events.push({
          id: `${exam.id}-admit`,
          exam,
          result,
          title: `${exam.shortCode} Admit Card Release`,
          dateStr: exam.admitCardDate,
          dateObj: new Date(exam.admitCardDate),
          eventType: 'Admit Card',
          isUrgent: false,
          isPast: new Date(exam.admitCardDate).getTime() < today.getTime(),
        });
      }
    }
  });

  // Sort events chronologically
  events.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  return (
    <div className="space-y-6">
      {/* Header & Filter tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Recruitment Calendar &amp; Timeline
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Key dates for applications, admit cards, and examinations tracked in chronological order.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-lg text-xs">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterMode === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            All Recruitment Events
          </button>
          <button
            onClick={() => setFilterMode('eligible')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterMode === 'eligible' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800' : 'text-neutral-400 hover:text-white'
            }`}
          >
            My Eligible Exams Only
          </button>
          <button
            onClick={() => setFilterMode('deadlines')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterMode === 'deadlines' ? 'bg-amber-950/60 text-amber-400 border border-amber-800' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Deadlines Only
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-12 text-center text-xs text-neutral-400">
            No events match the selected calendar filter.
          </div>
        ) : (
          events.map((evt) => {
            const isEligible = evt.result.verdict === 'ELIGIBLE' || evt.result.verdict === 'CONDITIONALLY_ELIGIBLE';

            return (
              <div
                key={evt.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border bg-neutral-900/60 p-4 transition-all hover:bg-neutral-900 ${
                  evt.isUrgent
                    ? 'border-amber-500/80 bg-amber-950/10'
                    : evt.isPast
                    ? 'border-neutral-800 opacity-60'
                    : 'border-neutral-800'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-800/80 text-xs font-mono font-bold text-neutral-200">
                    <Calendar className="h-4 w-4 text-amber-400" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <span className="font-semibold text-neutral-300">{evt.exam.shortCode}</span>
                      <span aria-hidden="true">·</span>
                      <span>{evt.eventType}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`font-semibold ${
                          isEligible ? 'text-emerald-400' : 'text-neutral-500'
                        }`}
                      >
                        {evt.result.verdictTitle}
                      </span>
                    </div>

                    <h4
                      onClick={() => onOpenDetails(evt.exam)}
                      className="cursor-pointer text-sm font-semibold text-white hover:text-amber-400 transition-colors"
                    >
                      {evt.title}
                    </h4>

                    <div className="text-xs text-neutral-400 flex items-center gap-2">
                      <span className="font-mono text-neutral-200">{evt.dateStr}</span>
                      {evt.isUrgent && (
                        <span className="font-medium text-amber-400">⚠️ Closing in few days!</span>
                      )}
                      {evt.isPast && (
                        <span className="text-neutral-500">(Window Closed)</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => onOpenDetails(evt.exam)}
                    className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:text-white hover:bg-neutral-700"
                  >
                    View Breakdown
                  </button>
                  <a
                    href={evt.exam.officialWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-neutral-400 hover:text-white"
                    title="Open official portal"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
