import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Auth API → Node/Express server
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true
      },
      // Whisper transcription → Flask server
      "/transcribe": {
        target: "http://localhost:7860",
        changeOrigin: true
      }
    }
  }
});

