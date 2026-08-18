import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import logo from "../assets/logo.png";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState("email"); // email, reset, success

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would send a reset email
      setMessage("If this email exists, a password reset link has been sent");
      setStep("reset");
    } catch (err) {
      setError("Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError("");

    setLoading(true);
    try {
      // In a real app, this would reset the password
      setMessage("Password reset successful! Redirecting to log in...");
      setStep("success");
      setTimeout(() => {
        navigate("/log-in");
      }, 2000);
    } catch (err) {
      setError("Failed to reset password");
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
            {step === "email" && (
              <>
                <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
                <p className="text-slate-400 mb-8">
                  Enter your email address and we'll send you a link to reset your password
                </p>

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400/50 focus:bg-white/10 transition"
                    />
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
                    {loading ? "Sending..." : "Send Reset Link"}
                    {!loading && <ArrowRight size={18} />}
                  </button>
                </form>
              </>
            )}

            {step === "reset" && (
              <>
                <h1 className="text-3xl font-bold mb-2">Create New Password</h1>
                <p className="text-slate-400 mb-8">Enter your new password below</p>

                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">New Password</label>
                    <input
                      type="password"
                      placeholder="At least 8 characters"
                      defaultValue=""
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400/50 focus:bg-white/10 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Confirm Password</label>
                    <input
                      type="password"
                      placeholder="Confirm password"
                      defaultValue=""
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400/50 focus:bg-white/10 transition"
                    />
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
                    {loading ? "Resetting..." : "Reset Password"}
                    {!loading && <ArrowRight size={18} />}
                  </button>
                </form>
              </>
            )}

            {step === "success" && (
              <>
                <div className="text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-900/20 mb-4">
                    <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-bold mb-2">Password Reset Successfully</h1>
                  <p className="text-slate-400">{message}</p>
                </div>
              </>
            )}

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate("/log-in")}
                className="text-sky-400 hover:text-cyan-400 transition text-sm font-semibold"
              >
                Back to Log In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
