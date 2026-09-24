import React, { useState } from 'react';
import { UserProfile, QualificationItem, CategoryType, GenderType } from '../types';
import { DEFAULT_USER_PROFILE } from '../data/presetProfiles';
import { X, Plus, Trash2, RotateCcw, Check, Sparkles } from 'lucide-react';

interface ProfileEditModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: UserProfile) => void;
}

const INDIAN_STATES = [
  'Uttar Pradesh',
  'Delhi (NCT)',
  'Bihar',
  'Maharashtra',
  'Rajasthan',
  'Madhya Pradesh',
  'West Bengal',
  'Haryana',
  'Punjab',
  'Tamil Nadu',
  'Karnataka',
  'Gujarat',
  'Odisha',
  'Jharkhand',
  'Telangana',
  'Andhra Pradesh',
  'Kerala',
  'Assam',
  'Uttarakhand',
  'Himachal Pradesh',
  'Chhattisgarh',
  'Jammu & Kashmir',
  'Goa',
  'Tripura',
  'Manipur',
  'Meghalaya',
  'Nagaland',
  'Mizoram',
  'Sikkim',
  'Arunachal Pradesh',
  'Chandigarh',
  'Puducherry',
  'Ladakh',
];

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<UserProfile>(JSON.parse(JSON.stringify(user)));
  const [activeTab, setActiveTab] = useState<'personal' | 'education' | 'skills' | 'preferences'>('personal');

  if (!isOpen) return null;

  const handleAddQualification = () => {
    const newQ: QualificationItem = {
      id: `q-${Date.now()}`,
      level: 'Bachelor',
      name: 'Degree Qualification',
      streamOrBranch: 'General',
      completionStatus: 'Completed',
      completionYear: 2024,
      percentageOrCgpa: 70,
    };
    setFormData(prev => ({
      ...prev,
      qualifications: [...prev.qualifications, newQ],
    }));
  };

  const handleRemoveQualification = (id: string) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter(q => q.id !== id),
    }));
  };

  const handleUpdateQualification = (id: string, field: keyof QualificationItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.map(q => {
        if (q.id === id) {
          return { ...q, [field]: value };
        }
        return q;
      }),
    }));
  };

  const handleReset = () => {
    setFormData(JSON.parse(JSON.stringify(DEFAULT_USER_PROFILE)));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl my-8 overflow-hidden text-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950 p-6">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Edit Eligibility Profile &amp; Preferences
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Updates will instantly re-evaluate age cutoffs and qualification rules across all recruitment exams.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/60 px-6 gap-2 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'personal'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            1. Personal &amp; Category
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('education')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'education'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            2. Qualifications ({formData.qualifications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('skills')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'skills'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            3. Skills &amp; Physical
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'preferences'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            4. Preferences &amp; Pay
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300">
                    Date of Birth (Crucial for Age Cutoff)
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
                    required
                  />
                  <div className="mt-1 text-[11px] text-neutral-400">
                    Prompt specified default: 12 June 2006
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as GenderType }))}
                    className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300">
                    Category (Determines Age Relaxation)
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as CategoryType }))}
                    className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="General">General (Unreserved - 0 yrs)</option>
                    <option value="OBC">OBC (Non-Creamy Layer - +3 yrs)</option>
                    <option value="SC">SC (Scheduled Caste - +5 yrs)</option>
                    <option value="ST">ST (Scheduled Tribe - +5 yrs)</option>
                    <option value="EWS">EWS (Economically Weaker Section)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300">
                    State of Domicile
                  </label>
                  <select
                    value={formData.stateOfDomicile}
                    onChange={(e) => setFormData(prev => ({ ...prev, stateOfDomicile: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'education' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-300">
                  Add all degrees, 10th, 12th, or diplomas (Completed or Pursuing):
                </span>
                <button
                  type="button"
                  onClick={handleAddQualification}
                  className="inline-flex items-center gap-1 rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-xs text-amber-400 hover:bg-neutral-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Qualification</span>
                </button>
              </div>

              <div className="space-y-3">
                {formData.qualifications.map((q, idx) => (
                  <div key={q.id} className="rounded-lg border border-neutral-800 bg-neutral-950/70 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-300">
                        #{idx + 1} {q.name || 'Qualification'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveQualification(q.id)}
                        className="text-neutral-500 hover:text-rose-400 p-1"
                        title="Delete qualification"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] text-neutral-400">Level</label>
                        <select
                          value={q.level}
                          onChange={(e) => handleUpdateQualification(q.id, 'level', e.target.value)}
                          className="mt-1 w-full rounded border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-xs text-white"
                        >
                          <option value="10th">10th Matriculation</option>
                          <option value="12th">12th Higher Secondary</option>
                          <option value="Diploma">Polytechnic / Diploma</option>
                          <option value="Bachelor">Bachelor's Degree</option>
                          <option value="Master">Master's Degree</option>
                          <option value="Professional">Professional (CA, etc.)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-neutral-400">Degree / Qualification Name</label>
                        <input
                          type="text"
                          value={q.name}
                          onChange={(e) => handleUpdateQualification(q.id, 'name', e.target.value)}
                          placeholder="e.g. B.A. History or 10+2"
                          className="mt-1 w-full rounded border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-neutral-400">Stream / Branch</label>
                        <input
                          type="text"
                          value={q.streamOrBranch || ''}
                          onChange={(e) => handleUpdateQualification(q.id, 'streamOrBranch', e.target.value)}
                          placeholder="e.g. PCM, AIML, History"
                          className="mt-1 w-full rounded border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div>
                        <label className="text-[11px] text-neutral-400">Status</label>
                        <select
                          value={q.completionStatus}
                          onChange={(e) => handleUpdateQualification(q.id, 'completionStatus', e.target.value)}
                          className="mt-1 w-full rounded border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-xs text-white"
                        >
                          <option value="Completed">Completed</option>
                          <option value="Pursuing">Currently Pursuing</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-neutral-400">
                          {q.completionStatus === 'Completed' ? 'Completion Year' : 'Expected Year'}
                        </label>
                        <input
                          type="number"
                          value={q.completionStatus === 'Completed' ? q.completionYear || 2024 : q.expectedCompletionYear || 2027}
                          onChange={(e) =>
                            handleUpdateQualification(
                              q.id,
                              q.completionStatus === 'Completed' ? 'completionYear' : 'expectedCompletionYear',
                              Number(e.target.value)
                            )
                          }
                          className="mt-1 w-full rounded border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-xs text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-neutral-400">Percentage / CGPA</label>
                        <input
                          type="number"
                          step="0.1"
                          value={q.percentageOrCgpa || ''}
                          onChange={(e) => handleUpdateQualification(q.id, 'percentageOrCgpa', Number(e.target.value))}
                          placeholder="e.g. 72.5 or 8.4"
                          className="mt-1 w-full rounded border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300">
                    English Typing Speed (WPM)
                  </label>
                  <input
                    type="number"
                    value={formData.skills.englishTypingSpeedWpm}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        skills: { ...prev.skills, englishTypingSpeedWpm: Number(e.target.value) },
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs font-mono text-white"
                  />
                  <div className="mt-1 text-[11px] text-neutral-400">
                    Standard Clerk benchmark is 35 WPM.
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300">
                    Hindi Typing Speed (WPM)
                  </label>
                  <input
                    type="number"
                    value={formData.skills.hindiTypingSpeedWpm}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        skills: { ...prev.skills, hindiTypingSpeedWpm: Number(e.target.value) },
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-neutral-300">
                    Candidate Height (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.physical.heightCm}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        physical: { ...prev.physical, heightCm: Number(e.target.value) },
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs font-mono text-white"
                  />
                  <div className="mt-1 text-[11px] text-neutral-400">
                    Required for Police &amp; Defence standards (e.g. 170cm male).
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.skills.hasNielitCCCorOLevel}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          skills: { ...prev.skills, hasNielitCCCorOLevel: e.target.checked },
                        }))
                      }
                      className="rounded border-neutral-700 text-amber-500 focus:ring-0"
                    />
                    <span>Possesses NIELIT CCC / O-Level Computer Certificate</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.skills.hasDrivingLicenseLMV}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          skills: { ...prev.skills, hasDrivingLicenseLMV: e.target.checked },
                        }))
                      }
                      className="rounded border-neutral-700 text-amber-500 focus:ring-0"
                    />
                    <span>Holds Valid Driving License (LMV - Light Motor Vehicle)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.physical.hasSpectacles}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          physical: { ...prev.physical, hasSpectacles: e.target.checked },
                        }))
                      }
                      className="rounded border-neutral-700 text-amber-500 focus:ring-0"
                    />
                    <span>Wears Spectacles (Affects Railway ALP A1 medical vision)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-5">
              <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-neutral-200">
                    Minimum Desired Monthly Pay
                  </span>
                  <span className="font-mono text-base font-bold text-amber-400 tabular-nums">
                    ₹{formData.preferences.minimumDesiredPay.toLocaleString('en-IN')}/month
                  </span>
                </div>
                <input
                  type="range"
                  min="18000"
                  max="60000"
                  step="1000"
                  value={formData.preferences.minimumDesiredPay}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, minimumDesiredPay: Number(e.target.value) },
                    }))
                  }
                  className="w-full h-2 cursor-pointer appearance-none rounded-lg bg-neutral-700 accent-amber-500"
                />
                <p className="text-[11px] text-neutral-400">
                  Exams with pay scales strictly below this threshold will be classified under "Excluded by Preferences".
                </p>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-semibold text-neutral-300">
                  Target Recruitment Exclusions (As Requested in Brief):
                </span>

                <div className="space-y-2.5 rounded-lg border border-neutral-800 bg-neutral-950 p-4">
                  <label className="flex items-start gap-3 text-xs text-neutral-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.preferences.excludeMilitaryDefence}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, excludeMilitaryDefence: e.target.checked },
                        }))
                      }
                      className="mt-0.5 rounded border-neutral-700 text-amber-500 focus:ring-0"
                    />
                    <div>
                      <div className="font-medium">Exclude Military &amp; Defence Examinations</div>
                      <div className="text-neutral-400 text-[11px]">
                        Filters out NDA, CDS, AFCAT, Agniveer, Territorial Army, Coast Guard.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 text-xs text-neutral-200 cursor-pointer pt-2 border-t border-neutral-800/80">
                    <input
                      type="checkbox"
                      checked={formData.preferences.excludeUPSC}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, excludeUPSC: e.target.checked },
                        }))
                      }
                      className="mt-0.5 rounded border-neutral-700 text-amber-500 focus:ring-0"
                    />
                    <div>
                      <div className="font-medium">Exclude UPSC Civil Services Examinations</div>
                      <div className="text-neutral-400 text-[11px]">
                        Filters out Union Public Service Commission CSE and related central cadre exams.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 text-xs text-neutral-200 cursor-pointer pt-2 border-t border-neutral-800/80">
                    <input
                      type="checkbox"
                      checked={formData.preferences.excludeCAExams}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, excludeCAExams: e.target.checked },
                        }))
                      }
                      className="mt-0.5 rounded border-neutral-700 text-amber-500 focus:ring-0"
                    />
                    <div>
                      <div className="font-medium">Exclude CA &amp; Accountancy Special Cadres</div>
                      <div className="text-neutral-400 text-[11px]">
                        Filters out Chartered Accountancy / specialized audit posts (e.g. CAG AAO).
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Footer controls */}
          <div className="flex items-center justify-between border-t border-neutral-800 pt-4">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-700"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset to Prompt Profile</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-neutral-800 px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-5 py-2 text-xs font-semibold text-neutral-950 transition-colors hover:bg-amber-400"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Save &amp; Recalculate</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
