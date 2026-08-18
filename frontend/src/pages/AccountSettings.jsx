import { useState } from "react";
import { useUser } from "../context/UserContext.jsx";
import { useNavigate } from "react-router-dom";

export default function AccountSettings() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("Settings saved (functionality can be extended)");
    setSaving(false);
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
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

        <form onSubmit={handleSave} className="space-y-6 p-6 border border-white/10 rounded-lg bg-white/5">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Full Name</label>
            <input 
              type="text" 
              defaultValue={user?.full_name || ""} 
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-sky-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Phone</label>
            <input 
              type="tel" 
              defaultValue={user?.phone || ""} 
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-sky-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Company</label>
            <input 
              type="text" 
              defaultValue={user?.company || ""} 
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-sky-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <input 
              type="email" 
              value={user?.email || ""} 
              disabled
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>

          {message && (
            <div className="p-3 rounded-lg bg-green-900/20 text-green-400 text-sm">
              {message}
            </div>
          )}

          <button 
            type="submit" 
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 font-semibold hover:opacity-90 disabled:opacity-50 transition"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
