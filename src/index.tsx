import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";
import { initClipboardListener } from "./clipboard-listener";
import { UIProvider } from "@yamada-ui/react";

initClipboardListener();

const rootEl = document.getElementById("root");

if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <UIProvider colorMode="dark">
        <App />
      </UIProvider>
    </React.StrictMode>
  );
}
