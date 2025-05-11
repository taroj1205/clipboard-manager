import { Outlet, createRootRoute } from "@tanstack/react-router";
import { useColorMode } from "@yamada-ui/react";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { changeColorMode } = useColorMode();
  changeColorMode("dark");

  return <Outlet />;
}
