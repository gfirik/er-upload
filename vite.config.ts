import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts: [
      "localhost",
      "ba43b88f4a33.ngrok-free.app",
      "er-upload.vercel.app",
    ],
    proxy: {
      "/__log": {
        target: "http://localhost:5173", // Your dev server
        configure: (proxy) => {
          proxy.on("proxyReq", (_proxyReq, req) => {
            if (req.method === "POST") {
              let body = "";
              req.on("data", (chunk) => (body += chunk));
              req.on("end", () => {
                const parsed = JSON.parse(body);
                console.log("[REMOTE LOG]", ...parsed.log);
              });
            }
          });
        },
      },
    },
  },
});
