import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  build: {
    // All three desktop webviews (WebKitGTK 2.40+, WebView2, WKWebView)
    // comfortably support ES2021 — transpiling further only bloats output.
    target: "es2021",
    rollupOptions: {
      output: {
        // Split heavyweight vendor libraries into cacheable chunks so the
        // startup bundle stays small and updates only invalidate what changed.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (/[\\/]node_modules[\\/](framer-motion|motion)/.test(id)) return "vendor-motion";
          if (
            /[\\/]node_modules[\\/](react-markdown|remark|unified|micromark|mdast|hast|unist|vfile|bail|trough|decode-named-character-reference|property-information|space-separated-tokens|comma-separated-tokens|character-entities)/.test(id)
          ) {
            return "vendor-markdown";
          }
          return "vendor";
        },
      },
    },
  },
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
});
