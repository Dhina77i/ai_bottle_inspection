import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path
      },
      "/upload-video": "http://localhost:8000",
      "/analytics": "http://localhost:8000",
      "/history": "http://localhost:8000",
      "/health": "http://localhost:8000",
      "/start-camera": "http://localhost:8000",
      "/stop-camera": "http://localhost:8000",
      "/processed": "http://localhost:8000",
      "/export-csv": "http://localhost:8000",
      "/ws": {
        target: "ws://localhost:8000",
        ws: true,
        changeOrigin: true
      }
    }
  }
});
