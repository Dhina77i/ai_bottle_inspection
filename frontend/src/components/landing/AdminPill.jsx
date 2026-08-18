import { useState, useRef, useEffect } from "react";
import { User, ChevronDown } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../context/UserContext.jsx";

export default function AdminPill() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // Close dropdown on click outside
  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }
  }, [open]);

  const email = user?.email || "admin@waterqa.ai";

  const handleNavigation = (path) => {
    try { console.log('[Navigation] AdminPill.handleNavigation', { path, from: location.pathname }); } catch (e) {}
    setOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    try { console.log('[Navigation] AdminPill.handleLogout', { from: location.pathname }); } catch (e) {}
    setOpen(false);
    logout();
    navigate("/");
  };

  return (
    <div className="admin-pill" ref={ref} style={{ position: "relative" }}>
      <button 
        className="inline-flex items-center gap-3" 
        onClick={() => setOpen((v) => !v)} 
        aria-expanded={open}
      >
        <span className="admin-avatar"><User size={16} /></span>
        <div className="admin-text">
          <strong>Admin Info</strong>
          <span>{email}</span>
        </div>
        <ChevronDown size={16} />
      </button>

      <div className={`admin-dropdown ${open ? "open" : ""}`} style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 60 }}>
        <ul>
          <li><button onClick={() => handleNavigation("/profile")}>Profile</button></li>
          <li><button onClick={() => handleNavigation("/account-settings")}>Account Settings</button></li>
          <li><button onClick={() => handleNavigation("/change-password")}>Change Password</button></li>
          <li><button onClick={() => handleNavigation("/activity-logs")}>Activity Logs</button></li>
          <li><button onClick={handleLogout}>Logout</button></li>
        </ul>
      </div>
    </div>
  );
}
