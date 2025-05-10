import { RouterProvider, createRouter } from "@tanstack/react-router";
import { UIProvider } from "@yamada-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { routeTree } from "./routeTree.gen";
import "./styles.css";

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
});

// Register things for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient();

const App = () => {
  return (
    <UIProvider colorMode="dark">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </UIProvider>
  );
};

export default App;
