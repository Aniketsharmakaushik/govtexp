import React from 'react';
import { GovernmentExam, EligibilityResult, ExamAlert } from '../types';
import { Bookmark, Bell, Trash2, Calendar, ExternalLink, ArrowRight } from 'lucide-react';

interface SavedAndAlertsViewProps {
  savedExams: GovernmentExam[];
  resultsMap: Record<string, EligibilityResult>;
  alerts: ExamAlert[];
  onToggleSave: (examId: string) => void;
  onDeleteAlert: (alertId: string) => void;
  onOpenDetails: (exam: GovernmentExam) => void;
  onNavigateToExams: () => void;
}

export const SavedAndAlertsView: React.FC<SavedAndAlertsViewProps> = ({
  savedExams,
  resultsMap,
  alerts,
  onToggleSave,
  onDeleteAlert,
  onOpenDetails,
  onNavigateToExams,
}) => {
  const downloadIcsCalendar = () => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//SarkariTrack//Exam Calendar//EN\n";
    
    savedExams.forEach((exam) => {
      const cleanDate = exam.applicationEndDate.replace(/-/g, '');
      icsContent += `BEGIN:VEVENT\nSUMMARY:${exam.shortCode} Application Deadline\nDESCRIPTION:Official deadline for ${exam.title}. Official portal: ${exam.officialWebsite}\nDTSTART;VALUE=DATE:${cleanDate}\nDTEND;VALUE=DATE:${cleanDate}\nSTATUS:CONFIRMED\nEND:VEVENT\n`;
    });

    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'SarkariTrack_Exam_Deadlines.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* 1. Saved / Bookmarked Exams Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-amber-400 fill-current" />
              <span>Bookmarked Examinations ({savedExams.length})</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Pinned recruitments you are actively tracking or preparing for.
            </p>
          </div>

          {savedExams.length > 0 && (
            <button
              onClick={downloadIcsCalendar}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:text-white hover:bg-neutral-700 whitespace-nowrap self-start sm:self-center"
            >
              <Calendar className="h-3.5 w-3.5 text-amber-400" />
              <span>Export iCalendar (.ics)</span>
            </button>
          )}
        </div>

        {savedExams.length === 0 ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-8 text-center space-y-3">
            <p className="text-xs text-neutral-400">
              You haven't bookmarked any exams yet. Click the bookmark icon on any exam card to pin it here.
            </p>
            <button
              onClick={onNavigateToExams}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-neutral-950 hover:bg-amber-400"
            >
              <span>Explore Eligible Exams</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedExams.map((exam) => {
              const res = resultsMap[exam.id];

              return (
                <div
                  key={exam.id}
                  className="flex flex-col justify-between rounded-lg border border-neutral-800 bg-neutral-900/70 p-4 space-y-3 hover:border-neutral-700 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <span>{exam.conductingBody}</span>
                      <button
                        onClick={() => onToggleSave(exam.id)}
                        className="text-amber-400 hover:text-rose-400 text-xs font-medium"
                      >
                        Remove
                      </button>
                    </div>

                    <h4
                      onClick={() => onOpenDetails(exam)}
                      className="cursor-pointer text-sm font-semibold text-white hover:text-amber-400 transition-colors"
                    >
                      {exam.title}
                    </h4>

                    <div className="text-xs text-neutral-300 font-mono tabular-nums">
                      Pay: ₹{exam.minGrossMonthlyPay.toLocaleString('en-IN')} – ₹{exam.maxGrossMonthlyPay.toLocaleString('en-IN')}/mo
                      {' · '}
                      Deadline: {exam.applicationEndDate}
                    </div>

                    {res && (
                      <div className="text-xs font-medium pt-1">
                        Status: <span className="text-amber-400">{res.verdictTitle}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-neutral-800/80 pt-2 text-xs">
                    <a
                      href={exam.officialWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-neutral-400 hover:text-white"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    <button
                      onClick={() => onOpenDetails(exam)}
                      className="rounded border border-neutral-700 bg-neutral-800 px-2.5 py-1 text-xs text-neutral-200 hover:bg-neutral-700"
                    >
                      Audit Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Custom Alerts & Notifications Section */}
      <div className="space-y-4 pt-4 border-t border-neutral-800">
        <div className="border-b border-neutral-800 pb-3">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-400" />
            <span>Active Reminders &amp; Deadlines ({alerts.length})</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Configured notifications for application closing windows, admit cards, and exam dates.
          </p>
        </div>

        {alerts.length === 0 ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-8 text-center text-xs text-neutral-400">
            No reminders configured yet. Open any exam details modal to set tailored deadline alerts.
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-neutral-800 bg-neutral-900/60 p-3.5 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-950/80 border border-amber-800 text-amber-400">
                    <Bell className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{alert.title}</div>
                    <div className="text-neutral-400 mt-0.5">
                      Type: {alert.alertType} · Scheduled: {alert.triggerDate}
                      {alert.note && ` · "${alert.note}"`}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteAlert(alert.id)}
                  className="rounded p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-neutral-800"
                  title="Delete alert"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
