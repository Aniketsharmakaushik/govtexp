export type CategoryType = 'General' | 'OBC' | 'SC' | 'ST' | 'EWS';
export type GenderType = 'Male' | 'Female' | 'Other';

export interface QualificationItem {
  id: string;
  level: '10th' | '12th' | 'Diploma' | 'Bachelor' | 'Master' | 'Professional';
  name: string; // e.g. "10+2 / Higher Secondary", "B.A. History", "B.Tech AIML"
  streamOrBranch?: string; // e.g. "PCM", "History", "AIML", "Commerce"
  completionStatus: 'Completed' | 'Pursuing';
  completionYear?: number;
  percentageOrCgpa?: number;
  expectedCompletionYear?: number;
}

export interface UserPreferences {
  minimumDesiredPay: number; // e.g. 27000
  excludeMilitaryDefence: boolean;
  excludeUPSC: boolean;
  excludeCAExams: boolean;
}

export interface PhysicalAttributes {
  heightCm: number;
  chestUnexpandedCm?: number;
  chestExpandedCm?: number;
  hasSpectacles: boolean;
  canPassEnduranceTest: boolean;
}

export interface UserSkills {
  englishTypingSpeedWpm: number;
  hindiTypingSpeedWpm: number;
  hasStenographySkill: boolean;
  hasNielitCCCorOLevel: boolean;
  hasDrivingLicenseLMV: boolean;
}

export interface UserProfile {
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD (e.g. 2006-06-12)
  gender: GenderType;
  category: CategoryType;
  stateOfDomicile: string;
  qualifications: QualificationItem[];
  physical: PhysicalAttributes;
  skills: UserSkills;
  preferences: UserPreferences;
}

export type ExamCategoryTag = 
  | 'Civilian Central'
  | 'Banking & Insurance'
  | 'Railways'
  | 'Defence & Police'
  | 'UPSC'
  | 'State Civil / PSC'
  | 'Technical & Research'
  | 'Judicial & Courts'
  | 'Auditing & Accounts';

export interface ExamPostItem {
  postName: string;
  payLevel: string;
  approxGrossMonthly: number;
  ageBracket: string;
  specialEligibility?: string;
  typingRequired?: boolean;
}

export interface GovernmentExam {
  id: string;
  title: string;
  shortCode: string;
  conductingBody: string; // e.g. "Staff Selection Commission (SSC)", "Railway Recruitment Boards (RRB)"
  categoryTag: ExamCategoryTag;
  totalVacancies: number;
  
  // Pay & Level
  payLevel: string; // e.g. "Level 4 to Level 8 (7th CPC)"
  minGrossMonthlyPay: number; // e.g. 35400
  maxGrossMonthlyPay: number; // e.g. 85000
  
  // Important Dates
  notificationDate: string; // YYYY-MM-DD
  applicationStartDate: string;
  applicationEndDate: string;
  admitCardDate?: string;
  examDate: string; // e.g. "September 2025" or exact date
  
  // Age Criteria
  ageCriteria: {
    minAge: number;
    maxAge: number;
    cutoffDate: string; // YYYY-MM-DD (Crucial: calculated on this reference date!)
    categoryRelaxationYears: {
      OBC: number;
      SC: number;
      ST: number;
      EWS: number;
      General: number;
    };
    specialAgeClauses?: string;
  };
  
  // Education Criteria
  educationRequirements: {
    minimumLevel: '10th' | '12th' | 'Diploma' | 'Bachelor' | 'Master';
    requiredDegreeName?: string; // e.g. "Any Bachelor's Degree" or "B.Tech / B.E."
    acceptedStreams?: string[]; // e.g. ["PCM"], ["Commerce"], ["Engineering"]
    acceptedDegrees?: string[]; // e.g. ["Mechanical", "Electrical", "CA"]
    allowsPursuingFinalYear: boolean;
    finalYearClause?: string;
    minimumPercentage?: number;
    requiredExperienceYears?: number;
  };
  
  // Nationality & Domicile
  domicileRules: {
    isAllIndia: boolean;
    preferentialState?: string;
    domicileNote?: string;
  };
  
  // Physical / Post specific
  physicalRequirements?: {
    genderRestricted?: 'Male' | 'Female' | 'All';
    minHeightCmMale?: number;
    minHeightCmFemale?: number;
    physicalTestNote?: string;
  };
  
  postSpecificRequirements?: {
    requiresEnglishTyping?: boolean;
    typingWpmRequired?: number;
    requiresComputerCertificate?: boolean;
    requiresDrivingLicense?: boolean;
    stenographyRequired?: boolean;
    note?: string;
  };
  
  // Links & Metadata
  officialWebsite: string;
  officialNotificationPdf: string;
  applicationFee: {
    generalOBC: number;
    scStWomenPwD: number;
  };
  
  selectionStages: string[];
  postsList: ExamPostItem[];
  latestUpdate: {
    headline: string;
    date: string;
    type: 'Notification' | 'Application Open' | 'Admit Card' | 'Exam Date' | 'Result' | 'Syllabus';
  };
  
  isDefenceMilitary?: boolean;
  isUPSC?: boolean;
  isCAExam?: boolean;
}

export type EligibilityVerdict = 'ELIGIBLE' | 'CONDITIONALLY_ELIGIBLE' | 'NOT_ELIGIBLE' | 'EXCLUDED';

export interface AgeAuditResult {
  status: 'PASS' | 'FAIL';
  userAgeOnCutoff: {
    years: number;
    months: number;
    days: number;
    text: string;
  };
  cutoffDate: string;
  minAgeRequired: number;
  baseMaxAge: number;
  relaxationAppliedYears: number;
  effectiveMaxAge: number;
  summaryExplanation: string;
}

export interface EducationAuditResult {
  status: 'PASS' | 'FAIL' | 'MANUAL_VERIFY';
  matchedQualification?: string;
  requiredLevel: string;
  summaryExplanation: string;
  isPursuingAcceptable: boolean;
}

export interface ManualVerificationItem {
  key: string;
  title: string;
  notificationRequirement: string;
  userAttributeValue: string;
  verificationInstructions: string;
}

export interface EligibilityResult {
  examId: string;
  verdict: EligibilityVerdict;
  verdictTitle: string;
  verdictDescription: string;
  
  ageAudit: AgeAuditResult;
  educationAudit: EducationAuditResult;
  preferenceAudit: {
    status: 'PASS' | 'EXCLUDED';
    salaryMatch: boolean;
    exclusionReason?: string;
    details: string;
  };
  domicileAudit: {
    status: 'PASS' | 'WARNING' | 'FAIL';
    details: string;
  };
  
  manualVerificationItems: ManualVerificationItem[];
  failingReasons: string[];
  passingReasons: string[];
}

export interface ExamAlert {
  id: string;
  examId: string;
  title: string;
  triggerDate: string;
  alertType: 'Application Deadline' | 'Admit Card' | 'Exam Day' | 'Custom';
  note: string;
  isActive: boolean;
  createdAt: string;
}
