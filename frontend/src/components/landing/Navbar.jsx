import { motion } from "framer-motion";
import { ArrowRight, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { useUser } from "../../context/UserContext.jsx";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Dashboard", href: "/app" },
  { label: "Live Inspection", href: "/app/live" },
  { label: "Analytics", href: "/app/analytics" },
  { label: "Reports", href: "#reports" },
  { label: "Documentation", href: "#documentation" }
];

export default function Navbar({ isDark, toggleDarkMode }) {
  const navigate = useNavigate();
  const { token } = useUser();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-white/10 bg-white/70 dark:bg-slate-950/40 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">

        {/* LOGO */}
        <a href="#home" className="flex items-center">
          <img
            src={logo}
            alt="Logo"
            className="h-10 w-auto object-contain"
          />
        </a>

        {/* NAV LINKS */}
        <nav className="hidden xl:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-black dark:hover:text-white transition"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-3">

          {/* THEME TOGGLE */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-slate-100 transition hover:border-sky-400/40 hover:text-sky-400"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* AUTH BUTTONS OR CTA */}
          {token ? (
            <a
              href="/app"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg transition hover:-translate-y-0.5"
            >
              Go to Dashboard
              <ArrowRight size={18} />
            </a>
          ) : (
            <>
              <button
                onClick={() => navigate("/sign-in")}
                className="inline-flex items-center rounded-2xl border border-slate-300 dark:border-white/20 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-100 bg-transparent hover:bg-white/5 transition"
              >
                Sign In
              </button>
              <a
                href="/app"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg transition hover:-translate-y-0.5"
              >
                Start Inspection
                <ArrowRight size={18} />
              </a>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}