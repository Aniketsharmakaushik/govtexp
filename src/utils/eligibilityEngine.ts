import {
  UserProfile,
  GovernmentExam,
  EligibilityResult,
  EligibilityVerdict,
  ManualVerificationItem,
} from '../types';
import { check_age } from './ageEngine';

export function evaluateExamEligibility(
  user: UserProfile,
  exam: GovernmentExam
): EligibilityResult {
  const failingReasons: string[] = [];
  const passingReasons: string[] = [];
  const manualVerificationItems: ManualVerificationItem[] = [];

  // ==========================================
  // 1. PREFERENCES & EXCLUSION AUDIT
  // ==========================================
  let isExcluded = false;
  let exclusionReason = '';

  if (exam.isDefenceMilitary && user.preferences.excludeMilitaryDefence) {
    isExcluded = true;
    exclusionReason = 'Excluded as per your preference: Military & Defence examinations are filtered out.';
  } else if (exam.isUPSC && user.preferences.excludeUPSC) {
    isExcluded = true;
    exclusionReason = 'Excluded as per your preference: UPSC examinations are filtered out.';
  } else if (exam.isCAExam && user.preferences.excludeCAExams) {
    isExcluded = true;
    exclusionReason = 'Excluded as per your preference: Chartered Accountancy & Finance examinations are filtered out.';
  } else if (exam.maxGrossMonthlyPay < user.preferences.minimumDesiredPay) {
    isExcluded = true;
    exclusionReason = `Pay level below your minimum filter: Max gross ₹${exam.maxGrossMonthlyPay.toLocaleString('en-IN')} is less than your ₹${user.preferences.minimumDesiredPay.toLocaleString('en-IN')}/month target.`;
  }

  const preferenceAudit = {
    status: (isExcluded ? 'EXCLUDED' : 'PASS') as 'PASS' | 'EXCLUDED',
    salaryMatch: exam.maxGrossMonthlyPay >= user.preferences.minimumDesiredPay,
    exclusionReason: isExcluded ? exclusionReason : undefined,
    details: isExcluded 
      ? exclusionReason 
      : `Pay bracket (₹${exam.minGrossMonthlyPay.toLocaleString('en-IN')} - ₹${exam.maxGrossMonthlyPay.toLocaleString('en-IN')}) satisfies your minimum salary threshold (₹${user.preferences.minimumDesiredPay.toLocaleString('en-IN')}).`,
  };

  if (!isExcluded) {
    passingReasons.push(`Salary matches your threshold: Gross pay up to ₹${exam.maxGrossMonthlyPay.toLocaleString('en-IN')}/mo.`);
  }

  // ==========================================
  // 2. AGE AUDIT (On Official Reference Date)
  // ==========================================
  const relaxationYears = exam.ageCriteria.categoryRelaxationYears[user.category] || 0;
  const ageCheck = check_age(
    user.dateOfBirth,
    exam.ageCriteria.cutoffDate,
    exam.ageCriteria.minAge,
    exam.ageCriteria.maxAge,
    relaxationYears
  );

  const ageAudit = {
    status: ageCheck.status,
    userAgeOnCutoff: {
      years: ageCheck.userAge.years,
      months: ageCheck.userAge.months,
      days: ageCheck.userAge.days,
      text: ageCheck.userAge.formattedText,
    },
    cutoffDate: exam.ageCriteria.cutoffDate,
    minAgeRequired: exam.ageCriteria.minAge,
    baseMaxAge: exam.ageCriteria.maxAge,
    relaxationAppliedYears: relaxationYears,
    effectiveMaxAge: ageCheck.effectiveMaxAge,
    summaryExplanation: ageCheck.explanation,
  };

  if (ageCheck.status === 'PASS') {
    passingReasons.push(
      `Age eligible on cutoff date (${ageCheck.cutoffDateFormatted}): ${ageCheck.userAge.formattedText} (Allowed: ${exam.ageCriteria.minAge}-${ageCheck.effectiveMaxAge} yrs).`
    );
  } else {
    failingReasons.push(ageCheck.failureReason || 'Age criteria not met on cutoff date.');
  }

  // ==========================================
  // 3. EDUCATION & DEGREE AUDIT
  // ==========================================
  const req = exam.educationRequirements;
  let eduStatus: 'PASS' | 'FAIL' | 'MANUAL_VERIFY' = 'FAIL';
  let matchedQualification = '';
  let eduExplanation = '';
  let isPursuingAcceptable = false;

  const completedQuals = user.qualifications.filter(q => q.completionStatus === 'Completed');
  const pursuingQuals = user.qualifications.filter(q => q.completionStatus === 'Pursuing');

  // Hierarchy index
  const levelRank: Record<string, number> = {
    '10th': 1,
    '12th': 2,
    'Diploma': 3,
    'Bachelor': 4,
    'Master': 5,
  };

  const reqRank = levelRank[req.minimumLevel] || 1;

  if (req.minimumLevel === '10th') {
    const has10th = completedQuals.some(q => q.level === '10th');
    if (has10th) {
      eduStatus = 'PASS';
      matchedQualification = '10th Matriculation';
      eduExplanation = 'Satisfies minimum education requirement (10th pass).';
    }
  } else if (req.minimumLevel === '12th') {
    // Check stream if mandated
    const twelfth = completedQuals.find(q => q.level === '12th');
    if (twelfth) {
      if (req.acceptedStreams && req.acceptedStreams.length > 0) {
        const streamMatches = req.acceptedStreams.some(s => 
          twelfth.streamOrBranch?.toLowerCase().includes(s.toLowerCase())
        );
        if (streamMatches) {
          eduStatus = 'PASS';
          matchedQualification = `12th (${twelfth.streamOrBranch})`;
          eduExplanation = `Satisfies 10+2 requirement with required stream (${twelfth.streamOrBranch}).`;
        } else {
          eduStatus = 'FAIL';
          eduExplanation = `Notification requires 12th in ${req.acceptedStreams.join('/')}. Your completed 12th is in ${twelfth.streamOrBranch || 'unspecified'}.`;
        }
      } else {
        eduStatus = 'PASS';
        matchedQualification = `12th (${twelfth.streamOrBranch || 'Standard'})`;
        eduExplanation = 'Satisfies 10+2 Higher Secondary qualification.';
      }
    }
  } else if (req.minimumLevel === 'Bachelor') {
    // Check completed bachelor degrees first
    const completedDegrees = completedQuals.filter(q => q.level === 'Bachelor' || q.level === 'Master');
    
    // Check if exam requires a specific degree/discipline
    if (req.acceptedDegrees && req.acceptedDegrees.length > 0) {
      const degreeMatch = completedDegrees.find(d => 
        req.acceptedDegrees?.some(ad => d.name.toLowerCase().includes(ad.toLowerCase()) || d.streamOrBranch?.toLowerCase().includes(ad.toLowerCase()))
      );

      if (degreeMatch) {
        eduStatus = 'PASS';
        matchedQualification = `${degreeMatch.name} (${degreeMatch.streamOrBranch || ''})`;
        eduExplanation = `Degree matches notification criteria: Completed ${degreeMatch.name}.`;
      } else {
        // Check if currently pursuing degree matches
        const pursuingMatch = pursuingQuals.find(d => 
          req.acceptedDegrees?.some(ad => d.name.toLowerCase().includes(ad.toLowerCase()) || d.streamOrBranch?.toLowerCase().includes(ad.toLowerCase()))
        );

        if (pursuingMatch) {
          if (req.allowsPursuingFinalYear) {
            eduStatus = 'MANUAL_VERIFY';
            isPursuingAcceptable = true;
            matchedQualification = `${pursuingMatch.name} (Pursuing)`;
            eduExplanation = `Pursuing ${pursuingMatch.name}. Notification allows final year candidates subject to submitting completion proof before ${req.finalYearClause || 'cutoff date'}. Manual verification of degree certificate date required.`;
            manualVerificationItems.push({
              key: 'pursuing_degree_proof',
              title: 'Final Year Appearance Eligibility Clause',
              notificationRequirement: `Must acquire completion certificate on or before ${req.finalYearClause || 'verification date'}.`,
              userAttributeValue: `${pursuingMatch.name} (Expected ${pursuingMatch.expectedCompletionYear || '2027'})`,
              verificationInstructions: 'Verify official notification paragraph on whether your expected result declaration date precedes the recruitment document verification deadline.',
            });
          } else {
            eduStatus = 'FAIL';
            eduExplanation = `Notification strictly requires completed ${req.acceptedDegrees.join('/')}. Your ${pursuingMatch.name} is currently pursuing and final-year appearing candidates are not permitted.`;
          }
        } else {
          eduStatus = 'FAIL';
          eduExplanation = `Requires qualification in ${req.acceptedDegrees.join(', ')}. Candidate completed: ${completedDegrees.map(d => d.name).join(', ') || 'None'}.`;
        }
      }
    } else {
      // General Bachelor degree required (e.g. Any Graduate)
      const anyBachelor = completedDegrees.find(d => d.level === 'Bachelor' || d.level === 'Master');
      if (anyBachelor) {
        eduStatus = 'PASS';
        matchedQualification = `${anyBachelor.name}`;
        eduExplanation = `Satisfies graduation criteria: Completed ${anyBachelor.name} from a recognized university.`;
      } else {
        // Candidate doesn't have a completed bachelor
        const pursuingBachelor = pursuingQuals.find(d => d.level === 'Bachelor');
        if (pursuingBachelor && req.allowsPursuingFinalYear) {
          eduStatus = 'MANUAL_VERIFY';
          isPursuingAcceptable = true;
          matchedQualification = `${pursuingBachelor.name} (Pursuing)`;
          eduExplanation = `Final year appearing allowed: Currently pursuing ${pursuingBachelor.name}. Official notification must be verified for exact result cutoff date.`;
          manualVerificationItems.push({
            key: 'pursuing_result_date',
            title: 'Degree Result Declaration Cutoff',
            notificationRequirement: req.finalYearClause || 'Graduation proof mandatory by prescribed deadline.',
            userAttributeValue: `${pursuingBachelor.name} (Pursuing)`,
            verificationInstructions: 'Check clause in official notification on whether your university result date precedes the document verification cutoff.',
          });
        } else {
          eduStatus = 'FAIL';
          eduExplanation = 'Graduation degree required. Candidate does not possess a completed recognized Bachelor degree.';
        }
      }
    }
  }

  // Percentage audit if applicable
  if (req.minimumPercentage && eduStatus === 'PASS') {
    const matched = user.qualifications.find(q => q.name.includes(matchedQualification) || matchedQualification.includes(q.name));
    if (matched && matched.percentageOrCgpa && matched.percentageOrCgpa < req.minimumPercentage) {
      eduStatus = 'FAIL';
      eduExplanation = `Minimum ${req.minimumPercentage}% aggregate required in qualifying exam. Candidate secured ${matched.percentageOrCgpa}%.`;
    }
  }

  const educationAudit = {
    status: eduStatus,
    matchedQualification,
    requiredLevel: `${req.minimumLevel}${req.acceptedDegrees ? ' (' + req.acceptedDegrees.join(', ') + ')' : ''}`,
    summaryExplanation: eduExplanation,
    isPursuingAcceptable,
  };

  if (eduStatus === 'PASS') {
    passingReasons.push(`Education criteria satisfied: ${matchedQualification}.`);
  } else if (eduStatus === 'FAIL') {
    failingReasons.push(eduExplanation);
  }

  // ==========================================
  // 4. DOMICILE & CITIZENSHIP AUDIT
  // ==========================================
  let domStatus: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';
  let domDetails = 'Open to all Indian citizens across all states.';

  if (!exam.domicileRules.isAllIndia && exam.domicileRules.preferentialState) {
    if (user.stateOfDomicile.toLowerCase() === exam.domicileRules.preferentialState.toLowerCase()) {
      domStatus = 'PASS';
      domDetails = `Resident of ${user.stateOfDomicile}, eligible for state domicile reservation/quota benefits.`;
      passingReasons.push(`State domicile matches (${user.stateOfDomicile}).`);
    } else {
      domStatus = 'WARNING';
      domDetails = `Conducted by ${exam.domicileRules.preferentialState}. Non-domicile candidates (${user.stateOfDomicile}) are treated strictly under Unreserved / General quota and cannot claim category relaxation.`;
      manualVerificationItems.push({
        key: 'state_domicile_quota',
        title: 'State Domicile & Category Quota',
        notificationRequirement: `Candidates from other states (${user.stateOfDomicile}) treated under General category without ${user.category} reservation.`,
        userAttributeValue: `Domicile: ${user.stateOfDomicile}, Category: ${user.category}`,
        verificationInstructions: 'Ensure you apply under the Unreserved (UR) category if not possessing a domicile certificate of the conducting state.',
      });
    }
  }

  // ==========================================
  // 5. POST-SPECIFIC & PHYSICAL REQS (MANUAL VERIFY)
  // ==========================================
  const postReq = exam.postSpecificRequirements;
  if (postReq) {
    if (postReq.requiresEnglishTyping) {
      const requiredWpm = postReq.typingWpmRequired || 35;
      const userWpm = user.skills.englishTypingSpeedWpm || 0;
      if (userWpm < requiredWpm) {
        manualVerificationItems.push({
          key: 'typing_speed_skill',
          title: 'Skill Test: Computer Typing Speed',
          notificationRequirement: `Typing speed of ${requiredWpm} W.P.M. in English on computer.`,
          userAttributeValue: userWpm > 0 ? `${userWpm} WPM recorded` : 'Typing test speed not certified',
          verificationInstructions: `Official typing test conducted in Stage 2/3. Candidate must achieve $\ge$ ${requiredWpm} WPM to qualify.`,
        });
      }
    }

    if (postReq.stenographyRequired) {
      if (!user.skills.hasStenographySkill) {
        manualVerificationItems.push({
          key: 'stenography_skill',
          title: 'Stenography Skill Test',
          notificationRequirement: '80/100 W.P.M. shorthand speed test.',
          userAttributeValue: 'No stenography certificate added',
          verificationInstructions: 'Stenography test is qualifying in nature. Verify whether you possess or are actively preparing for shorthand dictation.',
        });
      }
    }

    if (postReq.requiresComputerCertificate) {
      if (!user.skills.hasNielitCCCorOLevel) {
        manualVerificationItems.push({
          key: 'nielit_ccc_certificate',
          title: 'Computer Concept Certificate (CCC / NIELIT)',
          notificationRequirement: 'CCC / O Level / recognized equivalent computer diploma mandatory at verification.',
          userAttributeValue: 'No CCC record provided',
          verificationInstructions: 'Check if your graduation subject covered computer applications or obtain a recognized CCC certificate prior to document verification.',
        });
      }
    }
  }

  // Physical standards check
  if (exam.physicalRequirements) {
    const phys = exam.physicalRequirements;
    if (phys.genderRestricted && phys.genderRestricted !== 'All' && phys.genderRestricted !== user.gender) {
      failingReasons.push(`Gender restriction: This recruitment is only open to ${phys.genderRestricted} candidates.`);
    }

    if (phys.minHeightCmMale && user.gender === 'Male' && user.physical.heightCm < phys.minHeightCmMale) {
      failingReasons.push(`Physical Standard: Minimum height required for male candidates is ${phys.minHeightCmMale} cm. Candidate is ${user.physical.heightCm} cm.`);
    }

    if (phys.physicalTestNote) {
      manualVerificationItems.push({
        key: 'physical_endurance_test',
        title: 'Physical Standard & Endurance Test (PST/PET)',
        notificationRequirement: phys.physicalTestNote,
        userAttributeValue: `Height: ${user.physical.heightCm} cm, Endurance readiness: ${user.physical.canPassEnduranceTest ? 'Ready' : 'Pending'}`,
        verificationInstructions: 'Verify official notification physical endurance standards (running, long jump, chest expansion) before applying.',
      });
    }
  }

  // ==========================================
  // 6. FINAL VERDICT DETERMINATION
  // ==========================================
  let verdict: EligibilityVerdict = 'ELIGIBLE';
  let verdictTitle = 'Eligible to Apply';
  let verdictDescription = 'You fulfill the published age, education, and basic eligibility requirements for this exam.';

  if (isExcluded) {
    verdict = 'EXCLUDED';
    verdictTitle = 'Excluded by Your Preferences';
    verdictDescription = exclusionReason;
  } else if (failingReasons.length > 0) {
    verdict = 'NOT_ELIGIBLE';
    verdictTitle = 'Not Eligible';
    verdictDescription = failingReasons[0];
  } else if (manualVerificationItems.length > 0 || eduStatus === 'MANUAL_VERIFY') {
    verdict = 'CONDITIONALLY_ELIGIBLE';
    verdictTitle = '⚠️ Manual Verification Required';
    verdictDescription = 'You meet core age & educational requirements, but the official notification contains post-specific or skill conditions needing manual verification.';
  }

  return {
    examId: exam.id,
    verdict,
    verdictTitle,
    verdictDescription,
    ageAudit,
    educationAudit,
    preferenceAudit,
    domicileAudit: {
      status: domStatus,
      details: domDetails,
    },
    manualVerificationItems,
    failingReasons,
    passingReasons,
  };
}
