import { useState, FormEvent } from "react";
import { Link } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { registerAPI } from "../../api/authAPI";
import { useNavigate } from "react-router-dom";

// ── Defined OUTSIDE to prevent focus-loss bug on every re-render ──
interface FieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  suffix?: React.ReactNode;
}

const Field = ({
  label, name, type = "text", placeholder, required,
  hint, value, onChange, error, suffix,
}: FieldProps) => (
  <div>
    <Label>
      {label}{required && <span className="text-error-500">*</span>}
    </Label>
    <div className="relative">
      <Input
        name={name}
        type={type}
        placeholder={placeholder || ""}
        value={value}
        onChange={onChange}
      />
      {suffix && (
        <span className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2">
          {suffix}
        </span>
      )}
    </div>
    {error && (
      <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>
    )}
    {!error && hint && (
      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{hint}</p>
    )}
  </div>
);

export default function SignUpForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name:      "",
    last_name:       "",
    email:           "",
    password:        "",
    confirmPassword: "",
    student_number:  "",
    major:           "",
    enrollment_year: "",
    date_of_birth:   "",
    phone_number:    "",
  });

  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors]                 = useState<Record<string, string>>({});
  const [generalError, setGeneralError]               = useState("");
  const [loading, setLoading]                         = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
    setGeneralError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError("");

    if (form.password !== form.confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match." });
      return;
    }

    setLoading(true);
    try {
      await registerAPI({
        first_name:      form.first_name,
        last_name:       form.last_name,
        email:           form.email,
        password:        form.password,
        student_number:  form.student_number,
        major:           form.major,
        enrollment_year: form.enrollment_year ? parseInt(form.enrollment_year) : undefined,
        date_of_birth:   form.date_of_birth || undefined,
        phone_number:    form.phone_number || undefined,
      });
      navigate("/signin", { state: { message: "Registration successful! Please sign in." } });
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        const mapped: Record<string, string> = {};
        data.errors.forEach((msg: string) => {
          const m = msg.toLowerCase();
          if (m.includes("first name"))          mapped.first_name      = msg;
          else if (m.includes("last name"))       mapped.last_name       = msg;
          else if (m.includes("email"))           mapped.email           = msg;
          else if (m.includes("password") && m.includes("match"))
                                                  mapped.confirmPassword = msg;
          else if (m.includes("password"))        mapped.password        = msg;
          else if (m.includes("student number"))  mapped.student_number  = msg;
          else if (m.includes("major"))           mapped.major           = msg;
          else if (m.includes("enrollment"))      mapped.enrollment_year = msg;
          else if (m.includes("date of birth"))   mapped.date_of_birth   = msg;
          else if (m.includes("phone"))           mapped.phone_number    = msg;
          else setGeneralError(msg);
        });
        setFieldErrors(mapped);
      } else {
        setGeneralError(data?.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create your student account to get started!
            </p>
          </div>

          {/* General error banner */}
          {generalError && (
            <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">

              {/* ── Account Info section label ─────────── */}
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Account Info
              </p>

              {/* First Name + Last Name */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <Field
                    label="First Name" name="first_name" required
                    placeholder="Enter your first name"
                    value={form.first_name} onChange={handleChange}
                    error={fieldErrors.first_name}
                  />
                </div>
                <div className="sm:col-span-1">
                  <Field
                    label="Last Name" name="last_name" required
                    placeholder="Enter your last name"
                    value={form.last_name} onChange={handleChange}
                    error={fieldErrors.last_name}
                  />
                </div>
              </div>

              {/* Email */}
              <Field
                label="Email" name="email" type="email" required
                placeholder="Enter your email"
                value={form.email} onChange={handleChange}
                error={fieldErrors.email}
              />

              {/* Password */}
              <Field
                label="Password" name="password" required
                type={showPassword ? "text" : "password"}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                value={form.password} onChange={handleChange}
                error={fieldErrors.password}
                suffix={
                  <span onClick={() => setShowPassword(!showPassword)}>
                    {showPassword
                      ? <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      : <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    }
                  </span>
                }
              />

              {/* Confirm Password */}
              <Field
                label="Confirm Password" name="confirmPassword" required
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={form.confirmPassword} onChange={handleChange}
                error={fieldErrors.confirmPassword}
                suffix={
                  <span onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword
                      ? <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      : <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    }
                  </span>
                }
              />

              {/* ── Student Profile section label ──────── */}
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 pt-1">
                Student Profile
              </p>

              {/* Student Number + Enrollment Year */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <Field
                    label="Student Number" name="student_number" required
                    placeholder="8-digit number"
                    hint="Exactly 8 digits"
                    value={form.student_number} onChange={handleChange}
                    error={fieldErrors.student_number}
                  />
                </div>
                <div className="sm:col-span-1">
                  <Field
                    label="Enrollment Year" name="enrollment_year" type="number" required
                    placeholder={String(new Date().getFullYear())}
                    value={form.enrollment_year} onChange={handleChange}
                    error={fieldErrors.enrollment_year}
                  />
                </div>
              </div>

              {/* Major */}
              <Field
                label="Major / Field of Study" name="major" required
                placeholder="e.g. Computer Science"
                value={form.major} onChange={handleChange}
                error={fieldErrors.major}
              />

              {/* Date of Birth + Phone */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <Field
                    label="Date of Birth" name="date_of_birth" type="date"
                    value={form.date_of_birth} onChange={handleChange}
                    error={fieldErrors.date_of_birth}
                  />
                </div>
                <div className="sm:col-span-1">
                  <Field
                    label="Phone Number" name="phone_number" type="tel"
                    placeholder="9 digits"
                    hint="9 digits, numbers only"
                    value={form.phone_number} onChange={handleChange}
                    error={fieldErrors.phone_number}
                  />
                </div>
              </div>

              {/* Submit button — matches TailAdmin style exactly */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating account..." : "Sign Up"}
                </button>
              </div>

            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}