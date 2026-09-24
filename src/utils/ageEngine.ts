/**
 * Reusable Age Eligibility & Precision Calculation Engine
 * Indian Government Exams strictly mandate candidate age evaluated as on a specific
 * cutoff date (e.g. 01-08-2025, 01-01-2026, 01-07-2025), not the current date.
 */

export interface DetailedAge {
  years: number;
  months: number;
  days: number;
  totalDaysApprox: number;
  formattedText: string;
}

/**
 * Calculates exact age in years, months, and days between DOB and reference cutoff date
 */
export function calculateAgeOnDate(dobStr: string, cutoffDateStr: string): DetailedAge {
  const dob = new Date(dobStr);
  const cutoff = new Date(cutoffDateStr);

  let years = cutoff.getFullYear() - dob.getFullYear();
  let months = cutoff.getMonth() - dob.getMonth();
  let days = cutoff.getDate() - dob.getDate();

  if (days < 0) {
    // Borrow days from previous month
    months -= 1;
    // Days in previous month of cutoff date
    const prevMonthLastDay = new Date(cutoff.getFullYear(), cutoff.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const msDiff = cutoff.getTime() - dob.getTime();
  const totalDaysApprox = Math.floor(msDiff / (1000 * 60 * 60 * 24));

  const formattedText = `${years} ${years === 1 ? 'year' : 'years'}, ${months} ${months === 1 ? 'month' : 'months'}, ${days} ${days === 1 ? 'day' : 'days'}`;

  return {
    years,
    months,
    days,
    totalDaysApprox,
    formattedText,
  };
}

export interface AgeCheckOutput {
  status: 'PASS' | 'FAIL';
  userAge: DetailedAge;
  cutoffDateFormatted: string;
  minAgeRequired: number;
  baseMaxAge: number;
  relaxationAppliedYears: number;
  effectiveMaxAge: number;
  explanation: string;
  failureReason?: string;
}

/**
 * check_age: reusable official exam age checker function
 */
export function check_age(
  user_dob: string,
  notification_age_cutoff_date: string,
  min_age: number,
  max_age: number,
  category_relaxation: number = 0
): AgeCheckOutput {
  const age = calculateAgeOnDate(user_dob, notification_age_cutoff_date);
  const effectiveMaxAge = max_age + category_relaxation;

  // Formatting date for display: DD-MM-YYYY
  const cutoffDateObj = new Date(notification_age_cutoff_date);
  const cutoffFormatted = cutoffDateObj.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Verification
  const isUnderage = age.years < min_age;
  const isOverage = age.years > effectiveMaxAge || (age.years === effectiveMaxAge && (age.months > 0 || age.days > 0));

  let status: 'PASS' | 'FAIL' = 'PASS';
  let failureReason: string | undefined = undefined;

  if (isUnderage) {
    status = 'FAIL';
    failureReason = `Candidate is ${age.formattedText} on cutoff date ${cutoffFormatted}. Minimum age required is ${min_age} years. Candidate is underage by ${min_age - age.years} ${min_age - age.years === 1 ? 'year' : 'years'}.`;
  } else if (isOverage) {
    status = 'FAIL';
    failureReason = `Candidate is ${age.formattedText} on cutoff date ${cutoffFormatted}. Maximum allowed age is ${effectiveMaxAge} years (${max_age} base + ${category_relaxation} yrs category relaxation). Candidate is overage.`;
  }

  const relaxationNote = category_relaxation > 0 
    ? ` (includes ${category_relaxation} years category relaxation from base ${max_age} years)` 
    : '';

  const explanation = status === 'PASS'
    ? `Age on cutoff date (${cutoffFormatted}): ${age.formattedText}. Meets the required bracket of ${min_age} to ${effectiveMaxAge} years${relaxationNote}.`
    : (failureReason || 'Candidate age does not satisfy the notification reference date limits.');

  return {
    status,
    userAge: age,
    cutoffDateFormatted: cutoffFormatted,
    minAgeRequired: min_age,
    baseMaxAge: max_age,
    relaxationAppliedYears: category_relaxation,
    effectiveMaxAge,
    explanation,
    failureReason,
  };
}
