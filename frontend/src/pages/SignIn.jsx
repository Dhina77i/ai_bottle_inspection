import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useUser } from "../context/UserContext.jsx";
import logo from "../assets/logo.png";

// Get API URL dynamically
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:8000`;
};

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useUser();
  const API_URL = getApiUrl();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.full_name.trim()) {
      setError("Full name is required");
      return;
    }

    if (!formData.email.trim() || !formData.password) {
      setError("Email and password are required");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!formData.confirm_password) {
      setError("Confirm Password is required");
      return;
    }

    if (formData.confirm_password !== formData.password) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const registerUrl = `${API_URL}/api/users/register`;
      const payload = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      console.debug("Attempting registration with", registerUrl, payload);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const res = await fetch(registerUrl, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const responseText = await res.text();
      let responseData = null;
      try {
        responseData = responseText ? JSON.parse(responseText) : null;
      } catch (e) {
        console.debug("Registration response was not valid JSON", responseText);
      }
      console.debug("Registration response status", res.status, res.statusText, responseData || responseText);

      if (!res.ok) {
        const message = responseData?.detail || responseData?.message || responseText || `Registration failed: ${res.status} ${res.statusText}`;
        throw new Error(message);
      }

      // After successful registration, log in
      await login(formData.email.trim(), formData.password);
      
      if (rememberMe) {
        localStorage.setItem("remembered_email", formData.email.trim());
      }

      navigate("/app");
    } catch (err) {
      let message = err?.message || "Sign up failed";
      if (message === "Failed to fetch" || message?.includes("AbortError")) {
        message = "Unable to reach the backend server. Please make sure it is running.";
      } else if (message?.toLowerCase().includes("email already")) {
        message = "This email is already registered.";
      }
      setError(message);
      console.error("Registration error:", err);
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
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-slate-400 mb-8">Sign up to get started with water bottle inspection</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400/50 focus:bg-white/10 transition"
                />
              </div>

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
                <label className="block text-sm text-slate-300 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400/50 focus:bg-white/10 transition"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Confirm password"
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
                {loading ? "Creating Account..." : "Create Account"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/log-in")}
                  className="text-sky-400 hover:text-cyan-400 transition font-semibold"
                >
                  Log In
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
