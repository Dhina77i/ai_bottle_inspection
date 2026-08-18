import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (passwords.new !== passwords.confirm) {
      setMessage("New passwords do not match");
      return;
    }

    if (passwords.new.length < 8) {
      setMessage("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setMessage("Password change functionality can be extended with backend endpoint");
    setLoading(false);
    
    setTimeout(() => {
      setPasswords({ current: "", new: "", confirm: "" });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <button 
        onClick={() => navigate("/")}
        className="m-4 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition"
      >
        ← Back to Home
      </button>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Change Password</h1>

        <form onSubmit={handleSubmit} className="space-y-6 p-6 border border-white/10 rounded-lg bg-white/5 max-w-md">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Current Password</label>
            <input 
              type="password" 
              name="current"
              value={passwords.current}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-sky-400"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">New Password</label>
            <input 
              type="password" 
              name="new"
              value={passwords.new}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-sky-400"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
            <input 
              type="password" 
              name="confirm"
              value={passwords.confirm}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-sky-400"
              placeholder="Confirm new password"
            />
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${passwords.new === passwords.confirm && passwords.new.length >= 8 ? "bg-green-900/20 text-green-400" : "bg-yellow-900/20 text-yellow-400"}`}>
              {message}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full px-6 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 font-semibold hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
