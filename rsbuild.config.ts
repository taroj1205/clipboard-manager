import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { TanStackRouterRspack } from "@tanstack/router-plugin/rspack";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [pluginReact()],
  tools: {
    rspack: {
      plugins: [
        TanStackRouterRspack({ target: "react", autoCodeSplitting: true }),
      ],
    },
  },
  server: {
    port: 1420,
    strictPort: true,
    host,
  },
  dev: {
    client: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watchFiles: {
      paths: ["!**/src-tauri/**"],
    },
  },
});
