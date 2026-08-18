import { Moon, Sun } from "lucide-react";
import Logo from "../components/Logo.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="page-stack">
      <div className="page-header"><div><span className="eyebrow">System preferences</span><h1>Settings</h1></div></div>
      <section className="settings-grid">
        <div className="settings-panel">
          <Logo />
          <h2>Branding</h2>
          <p>The current logo is stored at <code>frontend/src/assets/logo.svg</code>. Replace it with your transparent company PNG or SVG to apply it across the navbar, sidebar, dashboard header, and favicon.</p>
        </div>
        <div className="settings-panel">
          {theme === "dark" ? <Moon /> : <Sun />}
          <h2>Theme</h2>
          <p>Switch between the dark industrial interface and a high-contrast light control room view.</p>
          <button className="button primary" onClick={toggleTheme}>Toggle {theme === "dark" ? "Light" : "Dark"} Mode</button>
        </div>
        <div className="settings-panel">
          <h2>YOLO Weights</h2>
          <p>Place your trained model at <code>backend/weights/best.pt</code> or set <code>YOLO_WEIGHTS</code> in the backend environment.</p>
        </div>
      </section>
    </div>
  );
}
