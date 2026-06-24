import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Local-only build: relative base so the built dist/index.html can be opened
// directly from the filesystem (double-click) as well as served.
export default defineConfig({
  base: "./",
  plugins: [react()],
});
