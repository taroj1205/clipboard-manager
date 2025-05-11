import { ColorModeScript, UIProvider, extendTheme } from "@yamada-ui/react";
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
				body: {
					bg: "blackAlpha.600",
				},
			},
		},
	})();

	root.render(
		<React.StrictMode>
			<ColorModeScript initialColorMode="dark" />
			<UIProvider colorMode="dark" theme={theme}>
				<App />
			</UIProvider>
		</React.StrictMode>,
	);
}
