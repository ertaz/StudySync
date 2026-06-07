// src/pages/Profile/ProfessorProfileForm.tsx
import { useState, useRef } from 'react';
import { UserProfile, ProfessorProfile, UpdateProfilePayload } from '../../services/profileService';
import {
  FormCard,
  InputField,
  PasswordSection,
} from './ProfilePage';

interface Props {
  profile: UserProfile;
  saving:  boolean;
  onSave:  (payload: UpdateProfilePayload) => Promise<boolean>;
}

const ProfessorProfileForm = ({ profile, saving, onSave }: Props) => {
  const pp = profile.profile as ProfessorProfile | undefined;

  const initialFirstName = profile.first_name;
  const initialLastName  = profile.last_name;
  const initialTitle     = pp?.title               ?? '';
  const initialDept      = pp?.department          ?? '';
  const initialYears     = String(pp?.years_of_experience ?? 0);
  const initialPhone     = pp?.phone_number        ?? '';

  const initial = useRef({
    first_name:          initialFirstName,
    last_name:           initialLastName,
    title:               initialTitle,
    department:          initialDept,
    years_of_experience: initialYears,
    phone_number:        initialPhone,
  });

  const [form, setForm] = useState({
    first_name:          initialFirstName,
    last_name:           initialLastName,
    title:               initialTitle,
    department:          initialDept,
    years_of_experience: initialYears,
    phone_number:        initialPhone,
    current_password:    '',
    new_password:        '',
    confirm_password:    '',
  });

  const [pwError, setPwError] = useState('');

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const snap    = initial.current;
  const isDirty =
    form.first_name          !== snap.first_name          ||
    form.last_name           !== snap.last_name           ||
    form.title               !== snap.title               ||
    form.department          !== snap.department          ||
    form.years_of_experience !== snap.years_of_experience ||
    form.phone_number        !== snap.phone_number        ||
    form.new_password        !== ''                       ||
    form.current_password    !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');

    if (form.new_password && form.new_password !== form.confirm_password) {
      setPwError('New passwords do not match.');
      return;
    }

    const payload: UpdateProfilePayload = {
      first_name:          form.first_name,
      last_name:           form.last_name,
      title:               form.title      || undefined,
      department:          form.department || undefined,
      phone_number:        form.phone_number || undefined,
      years_of_experience: form.years_of_experience
        ? parseInt(form.years_of_experience, 10)
        : 0,
    };

    if (form.new_password) {
      payload.current_password = form.current_password;
      payload.new_password     = form.new_password;
    }

    const ok = await onSave(payload);
    if (ok) {
      initial.current = {
        first_name:          form.first_name,
        last_name:           form.last_name,
        title:               form.title,
        department:          form.department,
        years_of_experience: form.years_of_experience,
        phone_number:        form.phone_number,
      };
      setForm((prev) => ({
        ...prev,
        current_password: '',
        new_password:     '',
        confirm_password: '',
      }));
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 pb-24">
        <FormCard title="Personal Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField
              label="First Name"
              value={form.first_name}
              onChange={(v) => set('first_name', v)}
            />
            <InputField
              label="Last Name"
              value={form.last_name}
              onChange={(v) => set('last_name', v)}
            />
          </div>
          <InputField label="Email" value={profile.email} disabled />
          <InputField
            label="Phone Number"
            value={form.phone_number}
            onChange={(v) => set('phone_number', v)}
            placeholder="e.g. +383 44 123 456"
          />
        </FormCard>

        <FormCard title="Professional Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField
              label="Title"
              value={form.title}
              onChange={(v) => set('title', v)}
              placeholder="e.g. Dr., Prof., Assist. Prof."
            />
            <InputField
              label="Years of Experience"
              type="number"
              value={form.years_of_experience}
              onChange={(v) => set('years_of_experience', v)}
              placeholder="e.g. 10"
            />
          </div>
          <InputField
            label="Department"
            value={form.department}
            onChange={(v) => set('department', v)}
            placeholder="e.g. Computer Science"
          />
        </FormCard>

        <PasswordSection
          currentPassword={form.current_password}
          newPassword={form.new_password}
          confirmPassword={form.confirm_password}
          pwError={pwError}
          onChange={set}
        />
      </form>

      {/* ── Sticky save bar — slides up when dirty ── */}
      <div
        className={`
          fixed bottom-0 left-0 right-0 z-50
          flex items-center justify-between
          bg-white dark:bg-boxdark
          border-t border-stroke dark:border-strokedark
          px-6 py-4 shadow-lg
          transition-transform duration-300
          ${isDirty ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">
          You have unsaved changes
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setForm({
                first_name:          snap.first_name,
                last_name:           snap.last_name,
                title:               snap.title,
                department:          snap.department,
                years_of_experience: snap.years_of_experience,
                phone_number:        snap.phone_number,
                current_password:    '',
                new_password:        '',
                confirm_password:    '',
              });
              setPwError('');
            }}
            className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-strokedark dark:text-gray-400 dark:hover:bg-meta-4 transition"
          >
            Discard
          </button>
          <button
            type="submit"
            form="professor-profile-form"
            disabled={saving}
            onClick={handleSubmit as any}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {saving && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfessorProfileForm;
