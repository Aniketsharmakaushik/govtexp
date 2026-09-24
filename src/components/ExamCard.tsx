import React from 'react';
import { GovernmentExam, EligibilityResult } from '../types';
import { Bookmark, ExternalLink, Calendar, AlertTriangle, CheckCircle, XCircle, Ban, Clock } from 'lucide-react';

interface ExamCardProps {
  exam: GovernmentExam;
  result: EligibilityResult;
  isSaved: boolean;
  onToggleSave: (examId: string) => void;
  onOpenDetails: (exam: GovernmentExam) => void;
}

export const ExamCard: React.FC<ExamCardProps> = ({
  exam,
  result,
  isSaved,
  onToggleSave,
  onOpenDetails,
}) => {
  // Application window calculation
  const today = new Date();
  const endDate = new Date(exam.applicationEndDate);
  const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isClosingSoon = diffDays > 0 && diffDays <= 14;
  const isClosed = diffDays < 0;

  // Status Styling & Icon
  const statusConfig = {
    ELIGIBLE: {
      border: 'border-neutral-800 hover:border-emerald-500/50',
      badgeBg: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60',
      icon: <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />,
      label: 'Strictly Eligible',
    },
    CONDITIONALLY_ELIGIBLE: {
      border: 'border-neutral-800 hover:border-amber-500/50',
      badgeBg: 'bg-amber-950/40 text-amber-400 border-amber-800/60',
      icon: <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />,
      label: '⚠️ Manual Verification Required',
    },
    NOT_ELIGIBLE: {
      border: 'border-neutral-800 hover:border-rose-500/40',
      badgeBg: 'bg-rose-950/30 text-rose-400 border-rose-900/40',
      icon: <XCircle className="h-4 w-4 text-rose-400 shrink-0" />,
      label: 'Not Eligible',
    },
    EXCLUDED: {
      border: 'border-neutral-800/80 opacity-75 hover:opacity-100',
      badgeBg: 'bg-neutral-800/60 text-neutral-400 border-neutral-700',
      icon: <Ban className="h-4 w-4 text-neutral-400 shrink-0" />,
      label: 'Excluded by Filters',
    },
  }[result.verdict];

  return (
    <div
      className={`group flex flex-col justify-between rounded-lg border bg-neutral-900/70 p-5 transition-all hover:bg-neutral-900 ${statusConfig.border}`}
    >
      <div>
        {/* Header line: Conducting body & Save Button */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span>{exam.conductingBody}</span>
              <span aria-hidden="true">·</span>
              <span>{exam.categoryTag}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {exam.totalVacancies.toLocaleString('en-IN')} Vacancies
              </span>
            </div>

            <h3
              onClick={() => onOpenDetails(exam)}
              className="cursor-pointer text-base font-semibold text-white transition-colors group-hover:text-amber-400"
            >
              {exam.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => onToggleSave(exam.id)}
            aria-label={isSaved ? 'Remove from saved' : 'Save exam'}
            className={`rounded-lg border p-2 text-xs transition-colors ${
              isSaved
                ? 'border-amber-600 bg-amber-500/10 text-amber-400'
                : 'border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Primary Salary & Schedule Row (Unboxed metadata) */}
        <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-300">
          <div>
            <span className="text-neutral-400">Gross Monthly: </span>
            <span className="font-mono font-semibold text-white tabular-nums">
              ₹{exam.minGrossMonthlyPay.toLocaleString('en-IN')} – ₹{exam.maxGrossMonthlyPay.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-neutral-700 hidden sm:inline" aria-hidden="true">·</span>
          <div>
            <span className="text-neutral-400">Level: </span>
            <span className="text-neutral-200">{exam.payLevel.split('(')[0]}</span>
          </div>
          <span className="text-neutral-700 hidden sm:inline" aria-hidden="true">·</span>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-neutral-400" />
            <span className="text-neutral-400">Deadline: </span>
            <span
              className={`font-mono tabular-nums ${
                isClosed
                  ? 'text-rose-400 font-medium'
                  : isClosingSoon
                  ? 'text-amber-400 font-medium'
                  : 'text-neutral-200'
              }`}
            >
              {exam.applicationEndDate}
              {isClosed ? ' (Closed)' : isClosingSoon ? ` (${diffDays}d left)` : ''}
            </span>
          </div>
        </div>

        {/* Status Verdict Banner with Plain English Reason */}
        <div className="mt-4 rounded-lg border border-neutral-800/80 bg-neutral-950/60 p-3">
          <div className="flex items-center gap-2">
            {statusConfig.icon}
            <span className="text-xs font-semibold tracking-wide text-neutral-200">
              {statusConfig.label}
            </span>
          </div>

          <p className="mt-1.5 text-xs text-neutral-300 leading-relaxed">
            {result.verdictDescription}
          </p>

          {/* Quick Audit Breakdown Snippets */}
          <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-neutral-800/60 pt-2 text-[11px] text-neutral-400">
            <div>
              <span className="text-neutral-400">Age as on {result.ageAudit.cutoffDate}: </span>
              <span
                className={`font-mono tabular-nums ${
                  result.ageAudit.status === 'PASS' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {result.ageAudit.userAgeOnCutoff.years}y {result.ageAudit.userAgeOnCutoff.months}m (
                {result.ageAudit.status === 'PASS' ? 'Pass' : 'Fail'})
              </span>
            </div>
            <div>
              <span className="text-neutral-400">Required: </span>
              <span className="text-neutral-300 truncate inline-block max-w-[200px] align-bottom">
                {exam.educationRequirements.minimumLevel}
                {exam.educationRequirements.acceptedStreams
                  ? ` (${exam.educationRequirements.acceptedStreams.join('/')})`
                  : ''}
              </span>
            </div>
          </div>

          {/* If manual verification items exist, preview the first one */}
          {result.manualVerificationItems.length > 0 && result.verdict === 'CONDITIONALLY_ELIGIBLE' && (
            <div className="mt-2 text-[11px] text-amber-400/90 font-medium">
              👉 Verification: {result.manualVerificationItems[0].title}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-neutral-800/80 pt-3">
        <a
          href={exam.officialWebsite}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors"
        >
          <span>Official Portal</span>
          <ExternalLink className="h-3 w-3" />
        </a>

        <button
          type="button"
          onClick={() => onOpenDetails(exam)}
          className="inline-flex items-center gap-1 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:border-amber-500/60 hover:bg-neutral-700"
        >
          <span>Audit Breakdown</span>
        </button>
      </div>
    </div>
  );
};
