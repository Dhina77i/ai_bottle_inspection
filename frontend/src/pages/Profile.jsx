import { useUser } from "../context/UserContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <button 
        onClick={() => navigate("/")}
        className="m-4 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition"
      >
        ← Back to Home
      </button>
      
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">User Profile</h1>
        
        {user ? (
          <div className="space-y-4 p-6 border border-white/10 rounded-lg bg-white/5">
            <div>
              <label className="text-sm text-gray-400">Full Name</label>
              <p className="text-lg">{user.full_name || "Not set"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Email</label>
              <p className="text-lg">{user.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Phone</label>
              <p className="text-lg">{user.phone || "Not set"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Company</label>
              <p className="text-lg">{user.company || "Not set"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Role</label>
              <p className="text-lg">{user.role || "Not set"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Registered</label>
              <p className="text-lg">{user.registered_at ? new Date(user.registered_at).toLocaleDateString() : "Not set"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Last Login</label>
              <p className="text-lg">{user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-400">No user data available</p>
        )}
      </div>
    </div>
  );
}
