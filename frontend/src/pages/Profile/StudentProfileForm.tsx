// src/pages/Profile/StudentProfileForm.tsx
import { useState, useRef } from 'react';
import { UserProfile, StudentProfile, UpdateProfilePayload } from '../../services/profileService';
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

const StudentProfileForm = ({ profile, saving, onSave }: Props) => {
  const sp = profile.profile as StudentProfile | undefined;

  const initialFirstName = profile.first_name;
  const initialLastName  = profile.last_name;
  const initialMajor     = sp?.major        ?? '';
  const initialDob       = sp?.date_of_birth ? sp.date_of_birth.split('T')[0] : '';
  const initialPhone     = sp?.phone_number  ?? '';

  const initial = useRef({
    first_name:    initialFirstName,
    last_name:     initialLastName,
    major:         initialMajor,
    date_of_birth: initialDob,
    phone_number:  initialPhone,
  });

  const [form, setForm] = useState({
    first_name:       initialFirstName,
    last_name:        initialLastName,
    major:            initialMajor,
    date_of_birth:    initialDob,
    phone_number:     initialPhone,
    current_password: '',
    new_password:     '',
    confirm_password: '',
  });

  const [pwError, setPwError] = useState('');

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const snap    = initial.current;
  const isDirty =
    form.first_name       !== snap.first_name    ||
    form.last_name        !== snap.last_name      ||
    form.major            !== snap.major          ||
    form.phone_number     !== snap.phone_number   ||
    form.date_of_birth    !== snap.date_of_birth  ||
    form.new_password     !== ''                  ||
    form.current_password !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');

    if (form.new_password && form.new_password !== form.confirm_password) {
      setPwError('New passwords do not match.');
      return;
    }

    const payload: UpdateProfilePayload = {
      first_name:    form.first_name,
      last_name:     form.last_name,
      major:         form.major,
      date_of_birth: form.date_of_birth || undefined,
      phone_number:  form.phone_number  || undefined,
    };

    if (form.new_password) {
      payload.current_password = form.current_password;
      payload.new_password     = form.new_password;
    }

    const ok = await onSave(payload);
    if (ok) {
      initial.current = {
        first_name:    form.first_name,
        last_name:     form.last_name,
        major:         form.major,
        date_of_birth: form.date_of_birth,
        phone_number:  form.phone_number,
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
          <InputField
            label="Date of Birth"
            type="date"
            value={form.date_of_birth}
            onChange={(v) => set('date_of_birth', v)}
          />
        </FormCard>

        <FormCard title="Academic Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField
              label="Student Number"
              value={sp?.student_number ?? '—'}
              disabled
            />
            <InputField
              label="Enrollment Year"
              value={sp?.enrollment_year ?? '—'}
              disabled
            />
          </div>
          <InputField
            label="Major"
            value={form.major}
            onChange={(v) => set('major', v)}
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
                first_name:       snap.first_name,
                last_name:        snap.last_name,
                major:            snap.major,
                date_of_birth:    snap.date_of_birth,
                phone_number:     snap.phone_number,
                current_password: '',
                new_password:     '',
                confirm_password: '',
              });
              setPwError('');
            }}
            className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-strokedark dark:text-gray-400 dark:hover:bg-meta-4 transition"
          >
            Discard
          </button>
        <button
          type="submit"
          form="student-profile-form"
          disabled={saving}
          onClick={handleSubmit as any}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
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

export default StudentProfileForm;
