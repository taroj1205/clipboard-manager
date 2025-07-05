import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { TanStackRouterRspack } from "@tanstack/router-plugin/rspack";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  dev: {
    client: host
      ? {
          host,
          port: 1421,
          protocol: "ws",
        }
      : undefined,
    watchFiles: {
      paths: ["!**/src-tauri/**"],
    },
  },
  plugins: [
    pluginReact({
      swcReactOptions: {
        importSource: "@emotion/react",
      },
    }),
  ],
  server: {
    host,
    port: 1420,
    strictPort: true,
  },
  tools: {
    rspack: {
      plugins: [
        TanStackRouterRspack({ target: "react", autoCodeSplitting: true }),
      ],
      module: {
        rules: [
          {
            test: /\\.jsx?$/,
            type: "javascript/auto",
            use: [
              {
                loader: "builtin:swc-loader",
                options: {
                  jsc: {
                    parser: {
                      jsx: true,
                      syntax: "ecmascript",
                    },
                  },
                },
              },
              { loader: "babel-loader" },
            ],
          },
          {
            test: /\\.tsx?$/,
            type: "javascript/auto",
            use: [
              {
                loader: "builtin:swc-loader",
                options: {
                  jsc: {
                    parser: {
                      tsx: true,
                      syntax: "typescript",
                    },
                  },
                },
              },
              { loader: "babel-loader" },
            ],
          },
        ],
      },
    },
  },
});
