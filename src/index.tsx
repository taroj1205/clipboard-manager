import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";
import { initClipboardListener } from "./clipboard-listener";
import { extendTheme, UIProvider } from "@yamada-ui/react";

initClipboardListener();

const rootEl = document.getElementById("root");

if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);

  const theme = extendTheme({
    styles: {
      globalStyle: {
        body: {
          bg: "blackAlpha.600",
        },
      },
    },
  })();

  root.render(
    <React.StrictMode>
      <UIProvider colorMode="dark" theme={theme}>
        <App />
      </UIProvider>
    </React.StrictMode>
  );
}
