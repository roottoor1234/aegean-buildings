import path from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    // Για εγκατάσταση σε υποφάκελο του XAMPP (π.χ. http://localhost/signage/) βάλε VITE_BASE=/signage/
    base: env.VITE_BASE || "/",
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
    server: {
      host: true,
      port: 4731,
      proxy: {
        // Τοπικά: npm run dev → php -S :8000 -t backend
        "/api": { target: "http://127.0.0.1:8000", changeOrigin: true },
      },
    },
    build: {
      chunkSizeWarningLimit: 700,
    },
  };
});
