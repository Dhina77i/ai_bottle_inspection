import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext.jsx";
import { useNavigate } from "react-router-dom";

export default function ActivityLogs() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchActivityLogs();
    }
  }, [user]);

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      // This endpoint would need to be created on the backend to fetch activity logs for a user
      // For now, we'll show placeholder data
      setActivities([
        { id: 1, action: "login", timestamp: new Date().toISOString(), details: "Logged in from 127.0.0.1" },
        { id: 2, action: "profile_view", timestamp: new Date(Date.now() - 3600000).toISOString(), details: "Viewed profile page" },
        { id: 3, action: "settings_update", timestamp: new Date(Date.now() - 7200000).toISOString(), details: "Updated account settings" },
      ]);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <button 
        onClick={() => navigate("/")}
        className="m-4 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition"
      >
        ← Back to Home
      </button>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Activity Logs</h1>

        {loading ? (
          <p className="text-gray-400">Loading activities...</p>
        ) : activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="p-4 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sky-400">{activity.action.replace(/_/g, " ").toUpperCase()}</p>
                    <p className="text-sm text-gray-400 mt-1">{activity.details}</p>
                  </div>
                  <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No activities recorded yet</p>
        )}
      </div>
    </div>
  );
}
