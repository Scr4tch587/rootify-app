import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/music-tree": "http://localhost:4000", // replace 3000 with your Express port
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
  resolve: {
    dedupe: ["react", "react-dom"],
  },
});
