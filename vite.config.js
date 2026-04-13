import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_PROXY_TARGET || "http://localhost:3001";

  return {
    server: {
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          // Only proxy in development, not in production
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('proxying:', req.method, req.url, '→', options.target);
            });
          }
        },
      },
    },
  };
});
