import { useState, useEffect } from 'react';
import { updateProfessorAPI } from '../../api/adminAPI';

// ── Types ─────────────────────────────────────────────────────
interface Professor {
  id:                   number;
  first_name:           string;
  last_name:            string;
  email:                string;
  title?:               string;
  department?:          string;
  years_of_experience?: number;
  phone_number?:        string;
}

interface EditProfessorModalProps {
  professor: Professor;
  onSuccess: () => void;
  onClose:   () => void;   // renamed from onCancel to match AdminDashboard
}

interface FormState {
  first_name:          string;
  last_name:           string;
  email:               string;
  password:            string;
  title:               string;
  department:          string;
  years_of_experience: string;
  phone_number:        string;
}

// ── Field component defined OUTSIDE so React never remounts it ─
interface FieldProps {
  label:        string;
  name:         keyof FormState;
  value:        string;
  onChange:     (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?:        string;
  placeholder?: string;
  required?:    boolean;
  disabled?:    boolean;
  error?:       string;
}

function Field({
  label, name, value, onChange,
  type = 'text', placeholder, required = false, disabled = false, error,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {label}{required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-800
                   placeholder:text-gray-400 outline-none transition
                   disabled:opacity-50 disabled:cursor-not-allowed
                   dark:text-white/90 dark:focus:bg-gray-800
                   ${error
                     ? 'border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-900/20'
                     : 'border-gray-200 bg-gray-50 focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-brand-500'
                   }`}
      />
      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────
export default function EditProfessorModal({
  professor,
  onSuccess,
  onClose,
}: EditProfessorModalProps) {

  const [form, setForm] = useState<FormState>({
    first_name:          '',
    last_name:           '',
    email:               '',
    password:            '',
    title:               '',
    department:          '',
    years_of_experience: '',
    phone_number:        '',
  });

  const [fieldErrors,  setFieldErrors]  = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [loading,      setLoading]      = useState(false);
  const [success,      setSuccess]      = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Pre-fill from flat Professor shape (title, department etc. live directly on the object)
  useEffect(() => {
    setForm({
      first_name:          professor.first_name                        || '',
      last_name:           professor.last_name                         || '',
      email:               professor.email                             || '',
      password:            '',
      title:               professor.title                             || '',
      department:          professor.department                        || '',
      years_of_experience: professor.years_of_experience != null
                             ? String(professor.years_of_experience)  : '',
      phone_number:        professor.phone_number                      || '',
    });
    setFieldErrors({});
    setGeneralError('');
    setSuccess(false);
    setShowPassword(false);
  }, [professor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
    setGeneralError('');
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.first_name.trim())
      errors.first_name = 'First name is required.';

    if (!form.last_name.trim())
      errors.last_name = 'Last name is required.';
    else if (form.last_name.trim().length < 2)
      errors.last_name = 'Last name must be at least 2 characters.';

    if (!form.email.trim())
      errors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = 'Enter a valid email address.';

    if (form.password.trim() !== '') {
      if (form.password.length < 8)
        errors.password = 'Password must be at least 8 characters.';
      else if (!/[A-Z]/.test(form.password))
        errors.password = 'Password must contain at least one uppercase letter.';
      else if (!/[0-9]/.test(form.password))
        errors.password = 'Password must contain at least one number.';
    }

    if (!form.title.trim()) {
      errors.title = 'Title is required.';
    } else if (!['Dr.', 'Prof.', 'MSc.'].includes(form.title.trim())) {
      errors.title = 'Title must be one of: Dr., Prof., MSc.';
    }

    if (!form.department.trim())
      errors.department = 'Department is required.';

    if (!form.years_of_experience.trim()) {
      errors.years_of_experience = 'Years of experience is required.';
    } else {
      const yoe = parseInt(form.years_of_experience);
      if (isNaN(yoe) || yoe < 0)
        errors.years_of_experience = 'Cannot be negative.';
      else if (yoe > 45)
        errors.years_of_experience = 'Cannot exceed 45 years.';
    }

    if (!form.phone_number.trim()) {
      errors.phone_number = 'Phone number is required.';
    } else if (!/^\d{9}$/.test(form.phone_number)) {
      errors.phone_number = 'Must be exactly 9 digits.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    if (!validate()) return;
    setLoading(true);

    try {
      await updateProfessorAPI(professor.id, {
        first_name:          form.first_name.trim(),
        last_name:           form.last_name.trim(),
        email:               form.email.trim(),
        ...(form.password.trim() !== '' && { password: form.password }),
        title:               form.title.trim(),
        department:          form.department.trim(),
        years_of_experience: parseInt(form.years_of_experience),
        phone_number:        form.phone_number.trim(),
      });

      setSuccess(true);
      setTimeout(() => { onSuccess(); }, 900);

    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.message) setGeneralError(data.message);
      else setGeneralError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || success;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={!isDisabled ? onClose : undefined}
      />

      {/* Modal panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl
                     dark:border-gray-700 dark:bg-gray-900
                     animate-in fade-in zoom-in-95 duration-200"
          onClick={e => e.stopPropagation()}
        >

          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Edit Professor</h2>
              <p className="mt-0.5 text-sm text-gray-400 dark:text-gray-500">
                Editing&nbsp;
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  {professor.first_name} {professor.last_name}
                </span>
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isDisabled}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600
                         dark:hover:bg-gray-800 dark:hover:text-gray-300 disabled:opacity-50 transition"
              aria-label="Close modal"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">

              {/* General error banner */}
              {generalError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-900/20">
                  <p className="text-sm text-red-600 dark:text-red-400">{generalError}</p>
                </div>
              )}

              {/* Success banner */}
              {success && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">
                  <p className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
                    <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Professor updated successfully!
                  </p>
                </div>
              )}

              {/* First + Last name */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="First Name" name="first_name" value={form.first_name} onChange={handleChange}
                  placeholder="e.g. John" required disabled={isDisabled} error={fieldErrors.first_name} />
                <Field label="Last Name" name="last_name" value={form.last_name} onChange={handleChange}
                  placeholder="e.g. Smith" required disabled={isDisabled} error={fieldErrors.last_name} />
              </div>

              {/* Email */}
              <Field label="Email" name="email" value={form.email} onChange={handleChange}
                type="email" placeholder="professor@university.edu" required disabled={isDisabled} error={fieldErrors.email} />

              {/* Title + Department */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Title" name="title" value={form.title} onChange={handleChange}
                  placeholder="e.g. Dr., Prof., MSc." required disabled={isDisabled} error={fieldErrors.title} />
                <Field label="Department" name="department" value={form.department} onChange={handleChange}
                  placeholder="e.g. Computer Science" required disabled={isDisabled} error={fieldErrors.department} />
              </div>

              {/* Experience + Phone */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Years of Exp. (0–45)" name="years_of_experience" value={form.years_of_experience}
                  onChange={handleChange} type="number" placeholder="e.g. 5" required
                  disabled={isDisabled} error={fieldErrors.years_of_experience} />
                <Field label="Phone Number" name="phone_number" value={form.phone_number}
                  onChange={handleChange} type="tel" placeholder="9 digits" required
                  disabled={isDisabled} error={fieldErrors.phone_number} />
              </div>

              {/* Password reset */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Reset Password
                </p>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    New Password
                    <span className="ml-2 normal-case text-gray-400 font-normal">(leave blank to keep current)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
                      disabled={isDisabled}
                      className={`w-full rounded-lg border px-3.5 py-2.5 pr-10 text-sm text-gray-800
                                 placeholder:text-gray-400 outline-none transition
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 dark:text-white/90 dark:focus:bg-gray-800
                                 ${fieldErrors.password
                                   ? 'border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-900/20'
                                   : 'border-gray-200 bg-gray-50 focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-brand-500'
                                 }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      disabled={isDisabled}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600
                                 dark:hover:text-gray-300 disabled:opacity-50 transition"
                    >
                      {showPassword ? (
                        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {fieldErrors.password && <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.password}</p>}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isDisabled}
                className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg border border-gray-200
                           hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
                           dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isDisabled}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white
                           rounded-lg bg-brand-500 hover:bg-brand-600 shadow-theme-xs
                           disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {loading ? (
                  <>
                    <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Saving…
                  </>
                ) : success ? (
                  <>
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Saved!
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </>
  );
}