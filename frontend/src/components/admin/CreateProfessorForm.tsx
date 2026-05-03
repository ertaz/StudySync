import { useState, FormEvent } from 'react';
import { EyeCloseIcon, EyeIcon } from '../../icons';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import { createProfessorAPI, CreateProfessorData } from '../../api/adminAPI';

interface Props {
  onSuccess: () => void;
  onCancel:  () => void;
}

// Defined outside to prevent focus-loss bug
interface FieldProps {
  label:        string;
  name:         string;
  type?:        string;
  placeholder?: string;
  hint?:        string;
  value:        string;
  onChange:     (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?:       string;
  suffix?:      React.ReactNode;
}

const Field = ({
  label, name, type = 'text', placeholder,
  hint, value, onChange, error, suffix,
}: FieldProps) => (
  <div>
    <Label>{label}</Label>
    <div className="relative">
      <Input
        name={name}
        type={type}
        placeholder={placeholder || ''}
        value={value}
        onChange={onChange}
      />
      {suffix && (
        <span className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2">
          {suffix}
        </span>
      )}
    </div>
    {error && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>}
    {!error && hint && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
  </div>
);

export default function CreateProfessorForm({ onSuccess, onCancel }: Props) {
  const [form, setForm] = useState({
    first_name:           '',
    last_name:            '',
    email:                '',
    password:             '',
    department:           '',
    title:                '',
    years_of_experience:  '',
    phone_number:         '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors]   = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading]           = useState(false);
  const [success, setSuccess]           = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
    setGeneralError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload: CreateProfessorData = {
        first_name:  form.first_name,
        last_name:   form.last_name,
        email:       form.email,
        password:    form.password,
        department:  form.department,
        title:       form.title || undefined,
        years_of_experience: form.years_of_experience
          ? parseInt(form.years_of_experience) : undefined,
        phone_number: form.phone_number || undefined,
      };

      const data = await createProfessorAPI(payload);
      setSuccess(`Professor ${data.professor.first_name} ${data.professor.last_name} created successfully!`);

      // Reset form
      setForm({
        first_name: '', last_name: '', email: '', password: '',
        department: '', title: '', years_of_experience: '', phone_number: '',
      });

      // Notify parent after short delay so user sees success message
      setTimeout(() => onSuccess(), 1500);

    } catch (err: any) {
      const data = err.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        const mapped: Record<string, string> = {};
        data.errors.forEach((msg: string) => {
          const m = msg.toLowerCase();
          if (m.includes('first name'))        mapped.first_name           = msg;
          else if (m.includes('last name'))    mapped.last_name            = msg;
          else if (m.includes('email'))        mapped.email                = msg;
          else if (m.includes('password'))     mapped.password             = msg;
          else if (m.includes('department'))   mapped.department           = msg;
          else if (m.includes('years'))        mapped.years_of_experience  = msg;
          else if (m.includes('phone'))        mapped.phone_number         = msg;
          else setGeneralError(msg);
        });
        setFieldErrors(mapped);
      } else {
        setGeneralError(data?.message || 'Failed to create professor. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
        Create New Professor
      </h3>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Fill in the details below. The professor will use these credentials to log in.
      </p>

      {/* Success banner */}
      {success && (
        <div className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20">
          {success}
        </div>
      )}

      {/* Error banner */}
      {generalError && (
        <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20">
          {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-5">

          {/* Section: Account */}
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Account Info
          </p>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="First Name *" name="first_name" placeholder="e.g. John"
              value={form.first_name} onChange={handleChange} error={fieldErrors.first_name} />
            <Field label="Last Name *" name="last_name" placeholder="e.g. Smith"
              value={form.last_name} onChange={handleChange} error={fieldErrors.last_name} />
          </div>

          <Field label="Email *" name="email" type="email" placeholder="professor@university.com"
            value={form.email} onChange={handleChange} error={fieldErrors.email} />

          <Field
            label="Password *" name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            hint="Share this password with the professor securely."
            value={form.password} onChange={handleChange} error={fieldErrors.password}
            suffix={
              <span onClick={() => setShowPassword(!showPassword)}>
                {showPassword
                  ? <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  : <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                }
              </span>
            }
          />

          {/* Section: Professor Profile */}
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 pt-1">
            Professor Profile
          </p>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Title" name="title" placeholder="e.g. Dr., Prof."
              value={form.title} onChange={handleChange} error={fieldErrors.title} />
            <Field label="Department *" name="department" placeholder="e.g. Computer Science"
              value={form.department} onChange={handleChange} error={fieldErrors.department} />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Years of Experience" name="years_of_experience" type="number"
              placeholder="e.g. 5"
              value={form.years_of_experience} onChange={handleChange}
              error={fieldErrors.years_of_experience} />
            <Field label="Phone Number" name="phone_number" type="tel"
              placeholder="9 digits" hint="9 digits, numbers only"
              value={form.phone_number} onChange={handleChange} error={fieldErrors.phone_number} />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center flex-1 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Professor'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center justify-center flex-1 px-4 py-3 text-sm font-medium text-gray-700 transition rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
            >
              Cancel
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}