import { Link as TanstackLink, type LinkProps as TanstackLinkProps } from "@tanstack/react-router";
import { type Merge, Link as UILink, type LinkProps as UILinkProps } from "@yamada-ui/react";
import React from "react";

export type LinkProps = Merge<TanstackLinkProps, Omit<UILinkProps, "href">>;

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(({ children, ...props }, ref) => {
  return (
    <UILink as={TanstackLink} ref={ref} {...props}>
      {children}
    </UILink>
  );
});

Link.displayName = "Link";
