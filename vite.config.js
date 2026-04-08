import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://72.61.143.83",
        changeOrigin: true,
      },
    },
  },
});
