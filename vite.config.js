import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Files in /public are served as-is at the site root (e.g. /logo.svg).
  publicDir: "public",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // Stable, cache-friendly vendor chunks; each page is split by the router.
        codeSplitting: {
          groups: [
            {
              name: "react",
              test: /node_modules[\\/](react|react-dom|react-router|scheduler|cookie|set-cookie-parser)[\\/]/,
              priority: 20,
            },
            { name: "icons", test: /node_modules[\\/]lucide-react[\\/]/, priority: 10 },
            { name: "markdown", test: /node_modules[\\/](react-markdown|remark-gfm)[\\/]/, priority: 10 },
          ],
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 3000,
  },
});
