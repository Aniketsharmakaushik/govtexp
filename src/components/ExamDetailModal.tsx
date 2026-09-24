import React, { useState } from 'react';
import { GovernmentExam, EligibilityResult, UserProfile } from '../types';
import {
  X,
  ExternalLink,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Ban,
  Clock,
  Briefcase,
  GraduationCap,
  FileText,
  Bell,
  Download,
  ShieldAlert,
} from 'lucide-react';

interface ExamDetailModalProps {
  exam: GovernmentExam;
  result: EligibilityResult;
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (examId: string) => void;
  onAddReminder: (examId: string, alertType: any, note: string) => void;
}

export const ExamDetailModal: React.FC<ExamDetailModalProps> = ({
  exam,
  result,
  user,
  isOpen,
  onClose,
  isSaved,
  onToggleSave,
  onAddReminder,
}) => {
  const [reminderType, setReminderType] = useState<'Application Deadline' | 'Admit Card' | 'Exam Day'>('Application Deadline');
  const [reminderNote, setReminderNote] = useState('');
  const [reminderSuccess, setReminderSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    onAddReminder(exam.id, reminderType, reminderNote || `Reminder for ${exam.shortCode} - ${reminderType}`);
    setReminderSuccess(true);
    setTimeout(() => setReminderSuccess(false), 2500);
  };

  const statusBadge = {
    ELIGIBLE: {
      bg: 'bg-emerald-950/60 border-emerald-800 text-emerald-300',
      icon: <CheckCircle className="h-5 w-5 text-emerald-400" />,
      text: 'Strictly Eligible to Apply',
    },
    CONDITIONALLY_ELIGIBLE: {
      bg: 'bg-amber-950/60 border-amber-800 text-amber-300',
      icon: <AlertTriangle className="h-5 w-5 text-amber-400" />,
      text: '⚠️ Manual Verification Required',
    },
    NOT_ELIGIBLE: {
      bg: 'bg-rose-950/60 border-rose-800 text-rose-300',
      icon: <XCircle className="h-5 w-5 text-rose-400" />,
      text: 'Not Eligible for this Recruitment',
    },
    EXCLUDED: {
      bg: 'bg-neutral-800 border-neutral-700 text-neutral-300',
      icon: <Ban className="h-5 w-5 text-neutral-400" />,
      text: 'Excluded as per Your Preferences',
    },
  }[result.verdict];

  // Age timeline math for visualization
  const minAge = exam.ageCriteria.minAge;
  const maxAge = result.ageAudit.effectiveMaxAge;
  const userAgeExact = result.ageAudit.userAgeOnCutoff.years + result.ageAudit.userAgeOnCutoff.months / 12;
  const rangeSpan = Math.max(15, (maxAge + 4) - (minAge - 2));
  const baseStart = minAge - 2;
  const allowedStartPercent = Math.max(0, Math.min(100, ((minAge - baseStart) / rangeSpan) * 100));
  const allowedWidthPercent = Math.max(5, Math.min(100, ((maxAge - minAge) / rangeSpan) * 100));
  const userPointPercent = Math.max(0, Math.min(100, ((userAgeExact - baseStart) / rangeSpan) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl my-8 overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-800 bg-neutral-950/60 p-6">
          <div className="space-y-1.5 pr-8">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="font-semibold text-amber-400">{exam.conductingBody}</span>
              <span aria-hidden="true">·</span>
              <span>{exam.categoryTag}</span>
              <span aria-hidden="true">·</span>
              <span>Notification: {exam.notificationDate}</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight sm:text-2xl">
              {exam.title}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-300 pt-1">
              <span>Vacancies: <strong className="font-mono tabular-nums text-white">{exam.totalVacancies.toLocaleString('en-IN')}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Pay: <strong className="font-mono tabular-nums text-white">₹{exam.minGrossMonthlyPay.toLocaleString('en-IN')} – ₹{exam.maxGrossMonthlyPay.toLocaleString('en-IN')}/mo</strong></span>
              <span aria-hidden="true">·</span>
              <span>Exam Date: <strong className="text-white">{exam.examDate}</strong></span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* 1. Overall Verdict Banner */}
          <div className={`rounded-xl border p-4 ${statusBadge.bg}`}>
            <div className="flex items-center gap-2.5">
              {statusBadge.icon}
              <h3 className="font-semibold text-sm sm:text-base tracking-tight">
                {statusBadge.text}
              </h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed opacity-90 sm:text-sm">
              {result.verdictDescription}
            </p>

            {/* Quick list of failing or passing conditions */}
            {result.failingReasons.length > 0 && (
              <div className="mt-3 border-t border-rose-800/40 pt-2 text-xs text-rose-300">
                <span className="font-semibold">Failing Condition Checklist:</span>
                <ul className="mt-1 list-disc list-inside space-y-0.5">
                  {result.failingReasons.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.passingReasons.length > 0 && (
              <div className="mt-3 border-t border-emerald-800/40 pt-2 text-xs text-emerald-300/90">
                <span className="font-semibold">Verified Requirements:</span>
                <ul className="mt-1 list-disc list-inside space-y-0.5">
                  {result.passingReasons.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 2. Manual Verification Items (Highlighted prominently if any) */}
          {result.manualVerificationItems.length > 0 && (
            <div className="rounded-xl border border-amber-800/80 bg-amber-950/30 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0" />
                <h4 className="text-sm font-semibold text-amber-300">
                  Manual Verification Checklist for Candidate
                </h4>
              </div>
              <p className="text-xs text-neutral-300">
                Official government recruitments often include post-specific clauses that require personal confirmation against the official PDF gazette:
              </p>

              <div className="space-y-3">
                {result.manualVerificationItems.map((item, idx) => (
                  <div key={idx} className="rounded-lg border border-amber-900/60 bg-neutral-900/90 p-3.5 space-y-1 text-xs">
                    <div className="font-semibold text-amber-400">
                      {idx + 1}. {item.title}
                    </div>
                    <div className="text-neutral-300">
                      <strong className="text-neutral-400">Notification Requirement: </strong>
                      {item.notificationRequirement}
                    </div>
                    <div className="text-neutral-300">
                      <strong className="text-neutral-400">Candidate Profile Record: </strong>
                      <span className="font-mono text-amber-200">{item.userAttributeValue}</span>
                    </div>
                    <div className="text-neutral-400 italic pt-1 border-t border-neutral-800/60">
                      📌 Instruction: {item.verificationInstructions}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Deep Dive: Age Calculation Engine */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-400" />
                <h4 className="text-sm font-semibold text-white">
                  Precision Age Eligibility Calculation
                </h4>
              </div>
              <span
                className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                  result.ageAudit.status === 'PASS'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}
              >
                {result.ageAudit.status === 'PASS' ? 'AGE PASS' : 'AGE REJECTED'}
              </span>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              {result.ageAudit.summaryExplanation}
            </p>

            {/* Visual Timeline Bar */}
            <div className="mt-4 pt-3 border-t border-neutral-800 space-y-2">
              <div className="flex justify-between text-[11px] text-neutral-400 font-mono">
                <span>Min: {minAge} yrs</span>
                <span className="text-amber-400 font-bold">
                  Your Age: {result.ageAudit.userAgeOnCutoff.years}y {result.ageAudit.userAgeOnCutoff.months}m {result.ageAudit.userAgeOnCutoff.days}d
                </span>
                <span>Max: {maxAge} yrs ({user.category})</span>
              </div>

              <div className="relative h-4 w-full rounded-full bg-neutral-800 overflow-hidden">
                {/* Permitted Age Range Band */}
                <div
                  className="absolute top-0 bottom-0 bg-emerald-500/30 border-x border-emerald-400/50"
                  style={{
                    left: `${allowedStartPercent}%`,
                    width: `${allowedWidthPercent}%`,
                  }}
                />
                {/* Candidate Marker */}
                <div
                  className={`absolute top-0 bottom-0 w-2 -ml-1 rounded-full shadow-lg ${
                    result.ageAudit.status === 'PASS' ? 'bg-amber-400' : 'bg-rose-500'
                  }`}
                  style={{
                    left: `${userPointPercent}%`,
                  }}
                  title={`Your calculated age: ${result.ageAudit.userAgeOnCutoff.text}`}
                />
              </div>

              <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                <span>DOB: {user.dateOfBirth}</span>
                <span>Cutoff Reference Date: {exam.ageCriteria.cutoffDate}</span>
                <span>Category Relaxation: +{result.ageAudit.relaxationAppliedYears} yrs</span>
              </div>
            </div>
          </div>

          {/* 4. Education & Degree Audit */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-amber-400" />
                <h4 className="text-sm font-semibold text-white">
                  Educational Qualification Breakdown
                </h4>
              </div>
              <span
                className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                  result.educationAudit.status === 'PASS'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : result.educationAudit.status === 'MANUAL_VERIFY'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}
              >
                {result.educationAudit.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3">
                <div className="text-neutral-400 font-medium">Notification Mandate:</div>
                <div className="mt-1 font-semibold text-neutral-100">
                  {exam.educationRequirements.requiredDegreeName || exam.educationRequirements.minimumLevel}
                </div>
                {exam.educationRequirements.acceptedStreams && (
                  <div className="mt-1 text-neutral-400">
                    Streams: {exam.educationRequirements.acceptedStreams.join(', ')}
                  </div>
                )}
                {exam.educationRequirements.finalYearClause && (
                  <div className="mt-1 text-[11px] text-amber-400/90">
                    Clause: {exam.educationRequirements.finalYearClause}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3">
                <div className="text-neutral-400 font-medium">Evaluated Candidate Qualifications:</div>
                <div className="mt-1 font-semibold text-neutral-100">
                  Matched: {result.educationAudit.matchedQualification || 'No qualifying degree'}
                </div>
                <div className="mt-1 text-neutral-400">
                  Completed: {user.qualifications.filter(q => q.completionStatus === 'Completed').map(q => q.name).join(', ')}
                </div>
                <div className="mt-0.5 text-neutral-400">
                  Pursuing: {user.qualifications.filter(q => q.completionStatus === 'Pursuing').map(q => q.name).join(', ') || 'None'}
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-300">
              {result.educationAudit.summaryExplanation}
            </p>
          </div>

          {/* 5. Post by Post Matrix (if available) */}
          {exam.postsList && exam.postsList.length > 0 && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-amber-400" />
                <h4 className="text-sm font-semibold text-white">
                  Post Matrix & Specific Requirements
                </h4>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-800 text-neutral-400 font-medium">
                      <th className="py-2 pr-4">Post Title</th>
                      <th className="py-2 px-4">Pay Scale</th>
                      <th className="py-2 px-4">Gross/mo</th>
                      <th className="py-2 px-4">Age Limit</th>
                      <th className="py-2 pl-4">Special Conditions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-mono tabular-nums">
                    {exam.postsList.map((p, idx) => (
                      <tr key={idx} className="hover:bg-neutral-900/60">
                        <td className="py-2.5 pr-4 font-sans font-medium text-neutral-200">
                          {p.postName}
                        </td>
                        <td className="py-2.5 px-4 text-neutral-300">{p.payLevel}</td>
                        <td className="py-2.5 px-4 font-semibold text-emerald-400">
                          ₹{p.approxGrossMonthly.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-4 text-neutral-300">{p.ageBracket}</td>
                        <td className="py-2.5 pl-4 font-sans text-neutral-400 text-[11px]">
                          {p.specialEligibility || (p.typingRequired ? 'Typing skill test' : 'Standard')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. Selection Stages & Application Window */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4 space-y-2">
              <div className="text-xs font-semibold text-neutral-300">
                Examination Stages
              </div>
              <ol className="list-decimal list-inside space-y-1 text-xs text-neutral-400">
                {exam.selectionStages.map((stage, idx) => (
                  <li key={idx} className="leading-relaxed">
                    <span className="text-neutral-200">{stage}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4 space-y-2">
              <div className="text-xs font-semibold text-neutral-300">
                Application Fee by Category
              </div>
              <div className="space-y-1 text-xs text-neutral-400 font-mono tabular-nums">
                <div className="flex justify-between">
                  <span>General / OBC / EWS:</span>
                  <span className="font-semibold text-white">₹{exam.applicationFee.generalOBC}</span>
                </div>
                <div className="flex justify-between">
                  <span>SC / ST / Women / PwD:</span>
                  <span className="font-semibold text-emerald-400">
                    {exam.applicationFee.scStWomenPwD === 0 ? 'Exempted (₹0)' : `₹${exam.applicationFee.scStWomenPwD}`}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-neutral-800">
                  <span>Window:</span>
                  <span className="text-neutral-300 font-sans">
                    {exam.applicationStartDate} to {exam.applicationEndDate}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 7. Interactive Alert / Reminder Creation Form */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-400" />
              <h4 className="text-sm font-semibold text-white">
                Set Alert or Deadline Reminder
              </h4>
            </div>

            <form onSubmit={handleCreateReminder} className="flex flex-col sm:flex-row gap-3">
              <select
                value={reminderType}
                onChange={(e) => setReminderType(e.target.value as any)}
                className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-200 focus:border-amber-500 focus:outline-none"
              >
                <option value="Application Deadline">Application Deadline (3 days before)</option>
                <option value="Admit Card">Admit Card Release Notice</option>
                <option value="Exam Day">Exam Schedule Date</option>
              </select>

              <input
                type="text"
                placeholder="Optional personal reminder note..."
                value={reminderNote}
                onChange={(e) => setReminderNote(e.target.value)}
                className="flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:border-amber-500 focus:outline-none"
              />

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-neutral-950 transition-colors hover:bg-amber-400 whitespace-nowrap"
              >
                <Bell className="h-3.5 w-3.5" />
                <span>Save Alert</span>
              </button>
            </form>

            {reminderSuccess && (
              <div className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Alert saved to your alerts queue successfully.</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Official Links & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-800 bg-neutral-950 p-6">
          <div className="flex items-center gap-3">
            <a
              href={exam.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3.5 py-2 text-xs font-medium text-neutral-200 transition-colors hover:bg-neutral-700"
            >
              <span>Official Recruitment Portal</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            <a
              href={exam.officialNotificationPdf}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3.5 py-2 text-xs font-medium text-amber-400 transition-colors hover:bg-neutral-700"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Official Gazette PDF</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave(exam.id)}
              className={`rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors ${
                isSaved
                  ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                  : 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
            >
              {isSaved ? '★ Bookmarked' : '☆ Bookmark'}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg bg-neutral-800 px-4 py-2 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-700 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
