import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { TanStackRouterRspack } from "@tanstack/router-plugin/rspack";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [
    pluginReact({
      swcReactOptions: {
        importSource: "@emotion/react",
      },
    }),
  ],
  tools: {
    rspack: {
      plugins: [TanStackRouterRspack({ target: "react", autoCodeSplitting: true })],
      module: {
        rules: [
          {
            test: /\\.jsx?$/,
            use: [
              {
                loader: "builtin:swc-loader",
                options: {
                  jsc: {
                    parser: {
                      syntax: "ecmascript",
                      jsx: true,
                    },
                  },
                },
              },
              { loader: "babel-loader" },
            ],
            type: "javascript/auto",
          },
          {
            test: /\\.tsx?$/,
            use: [
              {
                loader: "builtin:swc-loader",
                options: {
                  jsc: {
                    parser: {
                      syntax: "typescript",
                      tsx: true,
                    },
                  },
                },
              },
              { loader: "babel-loader" },
            ],
            type: "javascript/auto",
          },
        ],
      },
    },
    swc: {
      jsc: {
        experimental: {
          plugins: [["@swc/plugin-emotion", {}]],
        },
      },
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
