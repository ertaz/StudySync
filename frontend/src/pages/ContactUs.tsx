import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendContactMessageAPI } from '../api/contactAPI';
import { useAuth } from '../context/AuthContext';

const ContactUs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    name:    `${user!.first_name} ${user!.last_name}`,
    email:   user!.email,
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear field error when user starts typing
    if (fieldErrors[e.target.name]) {
      setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.name.trim()) {
      errors.name = 'Name is required.';
    }

    if (!form.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!form.subject.trim()) {
      errors.subject = 'Subject is required.';
    } else if (form.subject.trim().length < 3) {
      errors.subject = 'Subject must be at least 3 characters.';
    }

    if (!form.message.trim()) {
      errors.message = 'Message is required.';
    } else if (form.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearError = (field: string) =>
    setFieldErrors(prev => ({ ...prev, [field]: '' }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    setError('');
    try {
      await sendContactMessageAPI(form);
      setSuccess(true);
      setForm({ ...form, subject: '', message: '' });
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const inputBase = 'w-full rounded-lg border px-4 py-3 text-sm outline-none transition';
  const inputNormal = 'border-stroke bg-transparent text-black dark:border-strokedark dark:text-white focus:border-blue-500';
  const inputError = 'border-red-500 bg-red-50 text-black dark:bg-red-500/10 dark:text-white focus:border-red-500';

  const textareaBase = 'w-full rounded-lg border px-4 py-3 text-sm outline-none transition resize-none';
  const textareaNormal = 'border-stroke bg-transparent text-black dark:border-strokedark dark:text-white focus:border-blue-500';
  const textareaError = 'border-red-500 bg-red-50 text-black dark:bg-red-500/10 dark:text-white focus:border-red-500';

  return (
    <div className="mx-auto max-w-screen-md p-4 md:p-6">
      <div className="mb-8 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-stroke bg-white text-gray-600 hover:bg-gray-100 dark:border-strokedark dark:bg-boxdark dark:text-gray-300 dark:hover:bg-meta-4 transition"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Contact Us</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Have a question? Send us a message and we'll get back to you.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Name Field */}
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              onFocus={() => clearError('name')}
              required
              className={`${inputBase} ${fieldErrors.name ? inputError : inputNormal}`}
              placeholder="Your full name"
            />
            {fieldErrors.name && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{fieldErrors.name}</p>}
          </div>

          {/* Email Field */}
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onFocus={() => clearError('email')}
              required
              className={`${inputBase} ${fieldErrors.email ? inputError : inputNormal}`}
              placeholder="your@email.com"
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{fieldErrors.email}</p>}
          </div>

          {/* Subject Field */}
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              onFocus={() => clearError('subject')}
              required
              className={`${inputBase} ${fieldErrors.subject ? inputError : inputNormal}`}
              placeholder="What is this regarding?"
            />
            {fieldErrors.subject && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{fieldErrors.subject}</p>}
          </div>

          {/* Message Field */}
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              onFocus={() => clearError('message')}
              required
              rows={5}
              className={`${textareaBase} ${fieldErrors.message ? textareaError : textareaNormal}`}
              placeholder="Please provide details about your question or concern..."
            />
            {fieldErrors.message && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{fieldErrors.message}</p>}
          </div>

          {/* Success Message */}
          {success && (
            <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400">
              Your message was sent successfully! We'll get back to you soon.
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => {
                setForm({ ...form, subject: '', message: '' });
                setFieldErrors({});
                setError('');
              }}
              className="flex-1 rounded-lg border border-stroke py-3 text-sm font-medium text-black dark:border-strokedark dark:text-white hover:bg-gray-100 dark:hover:bg-meta-4 transition"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;