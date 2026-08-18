import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useUser } from "../context/UserContext.jsx";
import logo from "../assets/logo.png";

export default function LogIn() {
  const navigate = useNavigate();
  const { login } = useUser();
  const [formData, setFormData] = useState({
    email: localStorage.getItem("remembered_email") || "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem("remembered_email"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      await login(formData.email, formData.password);
      
      if (rememberMe) {
        localStorage.setItem("remembered_email", formData.email);
      } else {
        localStorage.removeItem("remembered_email");
      }

      navigate("/app");
    } catch (err) {
      setError(err.message || "Log in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(30,144,255,0.14),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.12),_transparent_26%)]" />
      <div className="pointer-events-none absolute left-1/2 top-32 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
          <button onClick={() => navigate("/")} className="flex items-center hover:opacity-80 transition">
            <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
          </button>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-slate-300 hover:text-white transition"
          >
            ← Back to Home
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-slate-400 mb-8">Log in to access your water bottle inspection dashboard</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400/50 focus:bg-white/10 transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-xs text-sky-400 hover:text-cyan-400 transition"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400/50 focus:bg-white/10 transition"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border border-white/20 bg-white/5 text-sky-400 focus:ring-sky-400"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-slate-300">
                  Remember me
                </label>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-900/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Log In"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/sign-in")}
                  className="text-sky-400 hover:text-cyan-400 transition font-semibold"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
