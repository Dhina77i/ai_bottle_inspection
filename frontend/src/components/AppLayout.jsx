import { BarChart3, Camera, ChevronDown, Gauge, History, Moon, Settings, Sun, Menu, UploadCloud, User, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";
import { useUser } from "../context/UserContext.jsx";
import Logo from "./Logo.jsx";

const navItems = [
  { to: "/app", label: "Dashboard", icon: Gauge, end: true },
  { to: "/app/live", label: "Live Inspection", icon: Camera },
  { to: "/app/upload", label: "Video Upload", icon: UploadCloud },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/history", label: "Inspection History", icon: History },
  { to: "/app/settings", label: "Settings", icon: Settings }
];

export default function AppLayout({ logo: propLogo }) {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const email = user?.email || "admin@waterqa.ai";

  // Close dropdown on click outside
  useEffect(() => {
    function onDoc(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape" && dropdownOpen) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }
  }, [dropdownOpen]);

  const handleNavigation = (path) => {
    // Log navigation source and current route for debugging
    try { console.log('[Navigation] AppLayout.handleNavigation', { path, from: location.pathname }); } catch (e) {}
    setDropdownOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    try { console.log('[Navigation] AppLayout.handleLogout', { from: location.pathname }); } catch (e) {}
    setDropdownOpen(false);
    logout();
    navigate("/");
  };

  return (
    <div className="shell">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <Logo />
        <nav>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setOpen(false)} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              <item.icon size={19} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <button className="icon-button mobile-only" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          {propLogo ? (
            <img src={propLogo} alt="Logo" className="h-10 w-auto object-contain" />
          ) : null}
          <div className="topbar-title">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <div className="topbar-actions">
            <button className="icon-button" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <div className="admin-pill" ref={dropdownRef} style={{ position: "relative" }}>
              <button 
                className="inline-flex items-center gap-3" 
                onClick={() => setDropdownOpen((v) => !v)} 
                aria-expanded={dropdownOpen}
              >
                <span className="admin-avatar"><User size={16} /></span>
                <div className="admin-text">
                  <strong>Admin Info</strong>
                  <span>{email}</span>
                </div>
                <ChevronDown size={16} />
              </button>

              <div className={`admin-dropdown ${dropdownOpen ? "open" : ""}`} style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 60 }}>
                <ul>
                  <li><button onClick={() => handleNavigation("/profile")}>Profile</button></li>
                  <li><button onClick={() => handleNavigation("/account-settings")}>Account Settings</button></li>
                  <li><button onClick={() => handleNavigation("/change-password")}>Change Password</button></li>
                  <li><button onClick={() => handleNavigation("/activity-logs")}>Activity Logs</button></li>
                  <li><button onClick={handleLogout}>Logout</button></li>
                </ul>
              </div>
            </div>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
