import {
  ColorModeScript,
  extendConfig,
  extendTheme,
  UIProvider,
} from "@yamada-ui/react";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";
import { initClipboardListener } from "./clipboard-listener";

initClipboardListener();

const rootEl = document.getElementById("root");

if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);

  const theme = extendTheme({
    styles: {
      globalStyle: {
        html: {
          bg: "blackAlpha.600",
        },
        body: {
          bg: "transparent",
          overflow: "clip",
        },
      },
    },
  })();

  const config = extendConfig({
    initialColorMode: "dark",
    notice: {
      options: {
        placement: "bottom-right",
        closeStrategy: "both",
        isClosable: true,
      },
    },
  });

  root.render(
    <React.StrictMode>
      <ColorModeScript initialColorMode="dark" />
      <UIProvider config={config} theme={theme}>
        <App />
      </UIProvider>
    </React.StrictMode>
  );
}
