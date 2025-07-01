import type { LinkProps as TanstackLinkProps } from "@tanstack/react-router";
import type { Merge, LinkProps as UILinkProps } from "@yamada-ui/react";
import { Link as TanstackLink } from "@tanstack/react-router";
import { Link as UILink } from "@yamada-ui/react";
import React from "react";

export type LinkProps = Merge<TanstackLinkProps, Omit<UILinkProps, "href">>;

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(({ children, ...props }, ref) => {
  return (
    <UILink ref={ref} as={TanstackLink} {...props}>
      {children}
    </UILink>
  );
});

Link.displayName = "Link";
