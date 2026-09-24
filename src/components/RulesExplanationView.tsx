import React from 'react';
import { ShieldCheck, AlertTriangle, BookOpen, Clock, Award, FileCheck } from 'lucide-react';

export const RulesExplanationView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="border-b border-neutral-800 pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-amber-400" />
          <span>SarkariTrack Engine Architecture &amp; Rules</span>
        </h2>
        <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
          How SarkariTrack eliminates false eligibility assurances and faithfully computes official Indian government recruitment rules.
        </p>
      </div>

      {/* 1. Age Calculation Rule */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-3">
        <div className="flex items-center gap-2.5 text-amber-400 font-semibold text-sm">
          <Clock className="h-4 w-4" />
          <span>Rule 1: Reference Cutoff Date vs Today's Date</span>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed">
          A common mistake made by generic calculators is computing candidate age against today's date. Indian recruitment notifications mandate age evaluated as on a strict reference date.
        </p>
        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-xs space-y-2">
          <div className="font-semibold text-neutral-200">Real-World Case Study:</div>
          <div className="text-neutral-400 leading-relaxed">
            • A candidate born on <strong className="text-neutral-200">12 June 2006</strong> is 18 years old in 2024.<br />
            • For <strong className="text-neutral-200">SSC CGL 2025</strong> with cutoff date <strong className="text-amber-400">01-08-2025</strong>, the candidate's age is precisely calculated as <strong className="text-white">19 years, 1 month, 20 days</strong>.<br />
            • For <strong className="text-neutral-200">SBI PO</strong> with min age requirement of 21 years as on <strong className="text-amber-400">01-04-2025</strong>, the candidate is 18y 9m and is strictly <strong className="text-rose-400">NOT ELIGIBLE</strong>.
          </div>
        </div>
      </div>

      {/* 2. Completed vs Pursuing Degrees */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-3">
        <div className="flex items-center gap-2.5 text-amber-400 font-semibold text-sm">
          <Award className="h-4 w-4" />
          <span>Rule 2: Completed Degrees vs Currently Pursuing</span>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed">
          Recruitment notifications generally require essential qualifications to be acquired on or before the closing date of the application or a specific crucial date.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3.5 space-y-1.5">
            <span className="font-semibold text-emerald-400">Completed Degree Validated</span>
            <p className="text-neutral-400">
              The user's completed <strong className="text-neutral-200">B.A. History</strong> satisfies "Any Graduate" criteria for SSC CGL, RRB NTPC, and EPFO SSA.
            </p>
          </div>

          <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3.5 space-y-1.5">
            <span className="font-semibold text-amber-400">Currently Pursuing Degree</span>
            <p className="text-neutral-400">
              The user's currently pursuing <strong className="text-neutral-200">B.Tech AIML (Exp 2027)</strong> does not satisfy engineering posts that require completed graduation by 2025, unless final-year appearing candidates are explicitly allowed by notification clause.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Manual Verification Discipline */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-3">
        <div className="flex items-center gap-2.5 text-amber-400 font-semibold text-sm">
          <AlertTriangle className="h-4 w-4" />
          <span>Rule 3: Anti-False-Positive &amp; Manual Verification Discipline</span>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed">
          Government jobs involve fine-grained qualifying stages:
        </p>
        <ul className="list-disc list-inside space-y-2 text-xs text-neutral-300">
          <li>
            <strong className="text-neutral-200">Typing &amp; Data Entry Skill Tests:</strong> Clerical and Assistant posts require 35 WPM in English or 30 WPM in Hindi. SarkariTrack flags these as <em>⚠️ Manual Verification Required</em> so applicants verify their speed before paying application fees.
          </li>
          <li>
            <strong className="text-neutral-200">Physical Standard Tests (PST / PET):</strong> Uniformed services (Havaldar, Police, Defence) have strict height, chest expansion, and vision benchmarks (such as Railway A1 medical standard with no eyeglasses).
          </li>
          <li>
            <strong className="text-neutral-200">State Domicile vs All-India Quotas:</strong> Candidates from other states are allowed in many state exams but strictly under the Unreserved (UR) General category without reservation benefits.
          </li>
        </ul>
      </div>

      {/* 4. Official Authority Disclaimer */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 text-xs text-neutral-400 space-y-2">
        <div className="flex items-center gap-2 text-neutral-200 font-semibold">
          <FileCheck className="h-4 w-4 text-emerald-400" />
          <span>Legal &amp; Official Notification Disclaimer</span>
        </div>
        <p className="leading-relaxed">
          SarkariTrack provides informational analysis based on published recruitment advertisements. Always cross-verify with the official notification PDF and gazette on the respective conducting body's official website (<code className="text-neutral-300 font-mono">ssc.gov.in</code>, <code className="text-neutral-300 font-mono">rrbcdg.gov.in</code>, <code className="text-neutral-300 font-mono">ibps.in</code>, etc.) prior to submitting an official application.
        </p>
      </div>
    </div>
  );
};
