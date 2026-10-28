import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icons/*.png"],
      manifest: {
        name: "FieldProof",
        short_name: "FieldProof",
        description:
          "Field work verification — GPS check-in, photo proof, team management",
        theme_color: "#0a0f1a",
        background_color: "#0a0f1a",
        display: "standalone",
        orientation: "any",
        start_url: "/",
        scope: "/",
        lang: "en",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.pathname.startsWith("/api") ||
              url.hostname.includes("onrender.com"),
            handler: "NetworkOnly",
          },
        ],
      },
    }),
  ],
});