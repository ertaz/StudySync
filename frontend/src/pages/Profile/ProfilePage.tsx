import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../api/useProfile';
import StudentProfileForm from './StudentProfileForm';
import ProfessorProfileForm from './ProfessorProfileForm';
import ProfileAvatar from './ProfileAvatar';

const ProfilePage = () => {
  const { profile, loading, saving, error, successMsg, saveProfile, clearMessages } =
    useProfile();

    const { logout } = useAuth();

  // Auto-dismiss success / error banners after 4 s
  useEffect(() => {
    if (!successMsg && !error) return;
    const timer = setTimeout(clearMessages, 4000);
    return () => clearTimeout(timer);
  }, [successMsg, error]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center text-red-500">
        Could not load profile. Please refresh the page.
      </div>
    );
  }

  const fullName = `${profile.first_name} ${profile.last_name}`;
  const roleLabel =
    profile.role.charAt(0).toUpperCase() + profile.role.slice(1);

  return (
          <div className="mx-auto max-w-4xl px-4 py-8">
              <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-white"
          > 
            ← Back to Home
          </Link>
        </div>
      {/* ── Header card ── */}
      <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm dark:bg-boxdark flex items-center justify-between">
  <div className="flex items-center gap-6">
    <ProfileAvatar name={fullName} />

    <div>
      <h1 className="text-2xl font-bold text-black dark:text-white">
        {fullName}
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {profile.email}
      </p>
      <span className="mt-1 inline-block rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
        {roleLabel}
      </span>
    </div>
  </div>

 <Link
  to="/signin"
  onClick={logout}
  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
>
  Sign Out
</Link>
</div>

      {/* ── Alerts ── */}
      {successMsg && (
        <div className="mb-4 flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-green-700 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400">
          <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400">
          <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* ── Role-specific form ── */}
      {profile.role === 'student' && (
        <StudentProfileForm
          profile={profile}
          saving={saving}
          onSave={saveProfile}
        />
      )}

      {profile.role === 'professor' && (
        <ProfessorProfileForm
          profile={profile}
          saving={saving}
          onSave={saveProfile}
        />
      )}

      {profile.role === 'admin' && (
        <AdminProfileForm
          profile={profile}
          saving={saving}
          onSave={saveProfile}
        />
      )}
    </div>
  );
};

// ── Minimal admin form (only base user fields + password) ──────────────
interface AdminProfileFormProps {
  profile: any;
  saving: boolean;
  onSave: (payload: any) => Promise<boolean>;
}

const AdminProfileForm = ({ profile, saving, onSave }: AdminProfileFormProps) => {
  const [form, setForm] = useState({
    first_name:       profile.first_name,
    last_name:        profile.last_name,
    current_password: '',
    new_password:     '',
    confirm_password: '',
  });
  const [pwError, setPwError] = useState('');

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');

    if (form.new_password && form.new_password !== form.confirm_password) {
      setPwError('New passwords do not match.');
      return;
    }

    const payload: any = {
      first_name: form.first_name,
      last_name:  form.last_name,
    };

    if (form.new_password) {
      payload.current_password = form.current_password;
      payload.new_password     = form.new_password;
    }

    const ok = await onSave(payload);
    if (ok) {
      setForm((prev) => ({
        ...prev,
        current_password: '',
        new_password:     '',
        confirm_password: '',
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormCard title="Personal Information">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField label="First Name" value={form.first_name} onChange={(v) => set('first_name', v)} />
          <InputField label="Last Name"  value={form.last_name}  onChange={(v) => set('last_name', v)}  />
        </div>
        <InputField label="Email" value={profile.email} disabled />
      </FormCard>

      <PasswordSection
        currentPassword={form.current_password}
        newPassword={form.new_password}
        confirmPassword={form.confirm_password}
        pwError={pwError}
        onChange={set}
      />

      <SaveButton saving={saving} />
    </form>
  );
};

// ── Shared sub-components ──────────────────────────────────────────────

export const FormCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-boxdark space-y-4">
    <h2 className="text-lg font-semibold text-black dark:text-white border-b border-stroke pb-3 dark:border-strokedark">
      {title}
    </h2>
    {children}
  </div>
);

export const InputField = ({
  label,
  value,
  onChange,
  type = 'text',
  disabled = false,
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange?: (v: string) => void;
  type?: string;
  disabled?: boolean;
  placeholder?: string;
}) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-black dark:text-white">
      {label}
    </label>
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-sm text-black outline-none transition focus:border-primary dark:border-strokedark dark:text-white dark:focus:border-primary disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-meta-4"
    />
  </div>
);

export const PasswordSection = ({
  currentPassword,
  newPassword,
  confirmPassword,
  pwError,
  onChange,
}: {
  currentPassword: string;
  newPassword:     string;
  confirmPassword: string;
  pwError:         string;
  onChange:        (field: string, value: string) => void;
}) => (
  <FormCard title="Change Password">
    <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
      Leave blank if you don't want to change your password.
    </p>
    <InputField
      label="Current Password"
      type="password"
      value={currentPassword}
      onChange={(v) => onChange('current_password', v)}
      placeholder="Enter current password"
    />
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <InputField
        label="New Password"
        type="password"
        value={newPassword}
        onChange={(v) => onChange('new_password', v)}
        placeholder="Min. 8 characters"
      />
      <InputField
        label="Confirm New Password"
        type="password"
        value={confirmPassword}
        onChange={(v) => onChange('confirm_password', v)}
        placeholder="Repeat new password"
      />
    </div>
    {pwError && (
      <p className="text-sm text-red-500">{pwError}</p>
    )}
  </FormCard>
);

export const SaveButton = ({ saving }: { saving: boolean }) => (
  <div className="flex justify-end">
    <button
      type="submit"
      disabled={saving}
      className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {saving && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      )}
      {saving ? 'Saving…' : 'Save Changes'}
    </button>
  </div>
);

export default ProfilePage;