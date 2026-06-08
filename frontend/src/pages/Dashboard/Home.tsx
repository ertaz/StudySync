import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

const features = [
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Structured Courses",
    desc: "Carefully sequenced modules that build knowledge step by step, from fundamentals to advanced topics.",
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: "Learn at Your Pace",
    desc: "Access courses anytime, anywhere and study on a schedule that works for you.",
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: "Expert Instructors",
    desc: "Access high-quality learning content created by experienced professionals",
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Professional Guidance",
    desc: "Learn through expert instruction and structured paths designed for real-world application.",
  },
];

const steps = [
  { number: "01", title: "Browse Courses", desc: "Explore our catalogue and find courses that match your goals and current level." },
  { number: "02", title: "Enroll Instantly", desc: "One click and you're in. No waiting lists, no complicated sign-up flows." },
  { number: "03", title: "Start Learning", desc: "Work through lessons at your own pace, with progress tracked automatically." },
  { number: "04", title: "Master Skills", desc: "Complete the course and strengthen your knowledge and practical abilities" },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">

        {/* Subtle grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(#1e40af 1px, transparent 1px),
                              linear-gradient(to right, #1e40af 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />

        <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-100 dark:bg-blue-900/30 blur-3xl opacity-60" />
        <div className="pointer-events-none absolute -bottom-24 right-0 w-80 h-80 rounded-full bg-indigo-100 dark:bg-indigo-900/30 blur-3xl opacity-50" />

        <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            <div className="flex-1 text-center lg:text-left">

              {/* Wordmark */}
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-none tracking-tight text-gray-900 dark:text-white mb-4">
                Study
                <span className="text-blue-600 dark:text-blue-400">Sync</span>
              </h1>

              <p className="text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto lg:mx-0 leading-relaxed mb-8">
                A destination for purposeful learning. Continue where you left off or explore new courses today
              </p>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <button
                  onClick={() => navigate("/courses")}
                  className="
                    inline-flex items-center justify-center gap-2
                    px-6 py-3.5 rounded-xl
                    bg-blue-600 hover:bg-blue-700 active:scale-[0.98]
                    text-white font-semibold text-sm
                    shadow-lg shadow-blue-500/25
                    transition-all duration-200
                  "
                >
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  </svg>
                  Go to Courses
                </button>

                <button
                  onClick={() => navigate("/profile")}
                  className="
                    inline-flex items-center justify-center gap-2
                    px-6 py-3.5 rounded-xl
                    bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
                    text-gray-700 dark:text-gray-200 font-semibold text-sm
                    transition-all duration-200
                  "
                >
                  My Profile
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Right — illustration card */}
            <div className="flex-1 w-full max-w-md lg:max-w-none">
              <div className="relative">
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src="/images/icons/Icon-right.png"
                    alt="StudySync Illustration"
                    className="w-full max-w-md object-contain"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Why StudySync?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-base">
            Everything you need to learn effectively, all in one place!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="
                group bg-white dark:bg-gray-800
                border border-gray-100 dark:border-gray-700
                rounded-2xl p-6
                hover:border-blue-200 dark:hover:border-blue-700
                hover:shadow-lg hover:shadow-blue-500/10
                transition-all duration-300
              "
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-600 transition-colors duration-300">
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="bg-white dark:bg-gray-800/50 border-y border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              How it works
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-base">
              Four simple steps stand between you and your next skill.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.number} className="relative flex flex-col items-center text-center">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-[calc(50%+28px)] w-[calc(100%-56px)] h-px bg-gradient-to-r from-blue-200 to-gray-200 dark:from-blue-800 dark:to-gray-700" />
                )}

                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-lg shadow-blue-500/25 z-10">
                  {step.number}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5">{step.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl px-8 py-12 text-center text-white shadow-2xl shadow-blue-500/20">

          {/* Decoration */}
          <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-20 -left-12 w-56 h-56 rounded-full bg-white/5" />

          <div className="relative">
            <h2 className="text-3xl font-bold mb-3">Ready to start learning?</h2>
            <p className="text-blue-100 max-w-md mx-auto mb-8 text-base">
              Browse our full catalogue and start your first lesson today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate("/courses")}
                className="
                  inline-flex items-center justify-center gap-2
                  px-7 py-3.5 rounded-xl
                  bg-white text-blue-700 font-semibold text-sm
                  hover:bg-blue-50 active:scale-[0.98]
                  shadow-lg shadow-black/10
                  transition-all duration-200
                "
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
                Browse All Courses
              </button>

              {user?.role === 'student' && (
                <button
                  onClick={() => navigate("/contact")}
                  className="
                    inline-flex items-center justify-center gap-2
                    px-7 py-3.5 rounded-xl
                    bg-white/10 hover:bg-white/20 text-white font-semibold text-sm
                    border border-white/30
                    active:scale-[0.98]
                    transition-all duration-200
                  "
                >
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Contact Us
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}