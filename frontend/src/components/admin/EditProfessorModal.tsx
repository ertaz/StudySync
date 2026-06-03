import { useState, useEffect } from 'react';
import { updateProfessorAPI } from '../../api/adminAPI';

// ── Types ─────────────────────────────────────────────────────
interface ProfessorProfile {
  title:               string;
  department:          string;
  years_of_experience: number;
  phone_number:        string;
}

interface Professor {
  id:         number;
  first_name: string;
  last_name:  string;
  email:      string;
  professorProfile?: ProfessorProfile;
}

interface EditProfessorModalProps {
  professor: Professor;
  onSuccess: () => void;
  onCancel:  () => void;
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

// ── Field component defined OUTSIDE the modal so React never
//    remounts it on re-render (fixes the "one character" focus bug)
// ─────────────────────────────────────────────────────────────
interface FieldProps {
  label:        string;
  name:         keyof FormState;
  value:        string;
  onChange:     (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?:        string;
  placeholder?: string;
  required?:    boolean;
  disabled?:    boolean;
}

function Field({
  label, name, value, onChange,
  type = 'text', placeholder, required = false, disabled = false,
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
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800
                   placeholder:text-gray-400
                   focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20
                   disabled:opacity-50 disabled:cursor-not-allowed
                   dark:border-gray-700 dark:bg-gray-800 dark:text-white/90
                   dark:focus:border-brand-500 dark:focus:bg-gray-800 transition"
      />
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────
export default function EditProfessorModal({
  professor,
  onSuccess,
  onCancel,
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

  const [errors,       setErrors]       = useState<string[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [success,      setSuccess]      = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Pre-fill form when modal opens
  useEffect(() => {
    setForm({
      first_name:          professor.first_name  || '',
      last_name:           professor.last_name   || '',
      email:               professor.email       || '',
      password:            '',
      title:               professor.professorProfile?.title               || '',
      department:          professor.professorProfile?.department          || '',
      years_of_experience: String(professor.professorProfile?.years_of_experience ?? ''),
      phone_number:        professor.professorProfile?.phone_number        || '',
    });
    setErrors([]);
    setSuccess(false);
    setShowPassword(false);
  }, [professor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors.length > 0) setErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    try {
      await updateProfessorAPI(professor.id, {
        first_name:          form.first_name.trim(),
        last_name:           form.last_name.trim(),
        email:               form.email.trim(),
        ...(form.password.trim() !== '' && { password: form.password }),
        title:               form.title.trim()               || undefined,
        department:          form.department.trim(),
        years_of_experience: form.years_of_experience ? parseInt(form.years_of_experience) : undefined,
        phone_number:        form.phone_number.trim()        || undefined,
      });

      setSuccess(true);
      setTimeout(() => { onSuccess(); }, 900);

    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        setErrors(data.errors);
      } else if (data?.message) {
        setErrors([data.message]);
      } else {
        setErrors(['Something went wrong. Please try again.']);
      }
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
        onClick={onCancel}
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
              onClick={onCancel}
              disabled={loading}
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

              {/* Error banner */}
              {errors.length > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-900/20">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                    Please fix the following:
                  </p>
                  <ul className="space-y-0.5">
                    {errors.map((e, i) => (
                      <li key={i} className="text-sm text-red-600 dark:text-red-400 flex items-start gap-1.5">
                        <span className="mt-0.5 shrink-0">•</span><span>{e}</span>
                      </li>
                    ))}
                  </ul>
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
                <Field label="First Name" name="first_name" value={form.first_name} onChange={handleChange} placeholder="e.g. John"  required disabled={isDisabled} />
                <Field label="Last Name"  name="last_name"  value={form.last_name}  onChange={handleChange} placeholder="e.g. Smith" required disabled={isDisabled} />
              </div>

              {/* Email */}
              <Field label="Email" name="email" value={form.email} onChange={handleChange} type="email" placeholder="professor@university.edu" required disabled={isDisabled} />

              {/* Title + Department */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Title"      name="title"      value={form.title}      onChange={handleChange} placeholder="e.g. Dr., Prof."        disabled={isDisabled} />
                <Field label="Department" name="department" value={form.department} onChange={handleChange} placeholder="e.g. Computer Science" required disabled={isDisabled} />
              </div>

              {/* Experience + Phone */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Years of Experience" name="years_of_experience" value={form.years_of_experience} onChange={handleChange} type="number" placeholder="e.g. 5"          disabled={isDisabled} />
                <Field label="Phone Number"        name="phone_number"        value={form.phone_number}        onChange={handleChange} type="tel"    placeholder="e.g. 044123456" disabled={isDisabled} />
              </div>

              {/* Password reset section */}
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
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 pr-10 text-sm text-gray-800
                                 placeholder:text-gray-400
                                 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90
                                 dark:focus:border-brand-500 dark:focus:bg-gray-800 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      disabled={isDisabled}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600
                                 dark:hover:text-gray-300 disabled:opacity-50 transition"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={onCancel}
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
