export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"]
      },
      colors: {
        carbon: "#06080d",
        panel: "#0d1320",
        cyanGlow: "#17e7ff",
        blueGlow: "#2f80ff",
        limePass: "#3ee47f",
        failRed: "#ff4d66"
      },
      boxShadow: {
        glow: "0 0 28px rgba(23, 231, 255, 0.22)",
        panel: "0 20px 70px rgba(0, 0, 0, 0.38)"
      }
    }
  },
  plugins: []
};
