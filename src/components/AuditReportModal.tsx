import React, { useState } from 'react';
import { GovernmentExam, EligibilityResult, UserProfile } from '../types';
import { X, Copy, Check, Printer, FileText } from 'lucide-react';

interface AuditReportModalProps {
  user: UserProfile;
  exams: GovernmentExam[];
  resultsMap: Record<string, EligibilityResult>;
  isOpen: boolean;
  onClose: () => void;
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({
  user,
  exams,
  resultsMap,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const eligibleCount = exams.filter(e => resultsMap[e.id]?.verdict === 'ELIGIBLE').length;
  const conditionalCount = exams.filter(e => resultsMap[e.id]?.verdict === 'CONDITIONALLY_ELIGIBLE').length;
  const notEligibleCount = exams.filter(e => resultsMap[e.id]?.verdict === 'NOT_ELIGIBLE').length;
  const excludedCount = exams.filter(e => resultsMap[e.id]?.verdict === 'EXCLUDED').length;

  const handleCopy = () => {
    let reportText = `=======================================================\n`;
    reportText += `SARKARITRACK - CANDIDATE ELIGIBILITY AUDIT REPORT\n`;
    reportText += `Generated on: ${new Date().toLocaleDateString('en-IN')}\n`;
    reportText += `=======================================================\n\n`;
    reportText += `CANDIDATE PROFILE:\n`;
    reportText += `Name: ${user.fullName}\n`;
    reportText += `Date of Birth: ${user.dateOfBirth}\n`;
    reportText += `Category: ${user.category}\n`;
    reportText += `Domicile: ${user.stateOfDomicile}\n`;
    reportText += `Completed Qualifications: ${user.qualifications.filter(q => q.completionStatus === 'Completed').map(q => q.name).join(', ')}\n`;
    reportText += `Currently Pursuing: ${user.qualifications.filter(q => q.completionStatus === 'Pursuing').map(q => q.name).join(', ')}\n`;
    reportText += `Minimum Desired Pay: ₹${user.preferences.minimumDesiredPay.toLocaleString('en-IN')}/mo\n\n`;
    reportText += `SUMMARY STATS:\n`;
    reportText += `Strictly Eligible: ${eligibleCount}\n`;
    reportText += `Manual Verification Required: ${conditionalCount}\n`;
    reportText += `Not Eligible: ${notEligibleCount}\n`;
    reportText += `Excluded by Preferences: ${excludedCount}\n\n`;
    reportText += `EXAM BREAKDOWN:\n`;
    reportText += `-------------------------------------------------------\n`;

    exams.forEach((exam) => {
      const res = resultsMap[exam.id];
      if (!res) return;
      reportText += `[${res.verdict}] ${exam.title} (${exam.conductingBody})\n`;
      reportText += `  Verdict: ${res.verdictTitle}\n`;
      reportText += `  Age on Cutoff (${res.ageAudit.cutoffDate}): ${res.ageAudit.userAgeOnCutoff.text} - ${res.ageAudit.status}\n`;
      reportText += `  Pay: ₹${exam.minGrossMonthlyPay} - ₹${exam.maxGrossMonthlyPay}\n`;
      if (res.failingReasons.length > 0) {
        reportText += `  Failure Reason: ${res.failingReasons.join(' | ')}\n`;
      }
      if (res.manualVerificationItems.length > 0) {
        reportText += `  Manual Verifications: ${res.manualVerificationItems.map(m => m.title).join(', ')}\n`;
      }
      reportText += `\n`;
    });

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl my-8 overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950 p-6">
          <div className="flex items-center gap-2.5">
            <FileText className="h-5 w-5 text-amber-400" />
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Candidate Eligibility Audit Report
              </h2>
              <p className="text-xs text-neutral-400">
                Official evaluation record based on published recruitment advertisements.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:text-white hover:bg-neutral-700"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:text-white hover:bg-neutral-700"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto font-sans text-xs">
          {/* Candidate Profile Box */}
          <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 space-y-2">
            <div className="font-semibold text-neutral-200 text-sm">
              Candidate Dossier
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-neutral-300">
              <div>
                <span className="text-neutral-500">Name:</span> <br />
                <strong className="text-white">{user.fullName}</strong>
              </div>
              <div>
                <span className="text-neutral-500">DOB:</span> <br />
                <span className="font-mono text-white">{user.dateOfBirth}</span>
              </div>
              <div>
                <span className="text-neutral-500">Category:</span> <br />
                <span className="text-white">{user.category}</span>
              </div>
              <div>
                <span className="text-neutral-500">Domicile:</span> <br />
                <span className="text-white">{user.stateOfDomicile}</span>
              </div>
            </div>

            <div className="border-t border-neutral-800/80 pt-2 text-neutral-300">
              <span className="text-neutral-500">Qualifications:</span>{' '}
              {user.qualifications.map(q => `${q.name} (${q.completionStatus})`).join(' · ')}
            </div>
          </div>

          {/* Audit Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="rounded-lg border border-emerald-900/60 bg-emerald-950/30 p-3">
              <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">{eligibleCount}</div>
              <div className="text-[11px] text-neutral-400">Strictly Eligible</div>
            </div>
            <div className="rounded-lg border border-amber-900/60 bg-amber-950/30 p-3">
              <div className="text-xl font-bold font-mono text-amber-400 tabular-nums">{conditionalCount}</div>
              <div className="text-[11px] text-neutral-400">Manual Verification</div>
            </div>
            <div className="rounded-lg border border-rose-900/60 bg-rose-950/30 p-3">
              <div className="text-xl font-bold font-mono text-rose-400 tabular-nums">{notEligibleCount}</div>
              <div className="text-[11px] text-neutral-400">Not Eligible</div>
            </div>
            <div className="rounded-lg border border-neutral-700 bg-neutral-800/40 p-3">
              <div className="text-xl font-bold font-mono text-neutral-400 tabular-nums">{excludedCount}</div>
              <div className="text-[11px] text-neutral-400">Excluded (Filters)</div>
            </div>
          </div>

          {/* Full Table */}
          <div className="rounded-lg border border-neutral-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="py-2.5 px-3">Exam Name</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Age on Cutoff</th>
                  <th className="py-2.5 px-3">Gross Pay</th>
                  <th className="py-2.5 px-3">Key Note / Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {exams.map((exam) => {
                  const res = resultsMap[exam.id];
                  if (!res) return null;

                  return (
                    <tr key={exam.id} className="hover:bg-neutral-850">
                      <td className="py-2.5 px-3 font-medium text-white">
                        {exam.shortCode}
                      </td>
                      <td className="py-2.5 px-3 font-semibold whitespace-nowrap">
                        <span
                          className={
                            res.verdict === 'ELIGIBLE'
                              ? 'text-emerald-400'
                              : res.verdict === 'CONDITIONALLY_ELIGIBLE'
                              ? 'text-amber-400'
                              : res.verdict === 'NOT_ELIGIBLE'
                              ? 'text-rose-400'
                              : 'text-neutral-500'
                          }
                        >
                          {res.verdict}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-neutral-300 tabular-nums whitespace-nowrap">
                        {res.ageAudit.userAgeOnCutoff.years}y {res.ageAudit.userAgeOnCutoff.months}m ({res.ageAudit.status})
                      </td>
                      <td className="py-2.5 px-3 font-mono text-neutral-300 tabular-nums whitespace-nowrap">
                        ₹{exam.minGrossMonthlyPay.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-400 text-[11px]">
                        {res.failingReasons[0] || (res.manualVerificationItems[0] ? `Verify: ${res.manualVerificationItems[0].title}` : res.verdictDescription)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-neutral-800 bg-neutral-950 p-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-neutral-800 px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
