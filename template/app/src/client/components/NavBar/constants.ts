import { routes } from "wasp/client/router";
import { BlogUrl, DocsUrl } from "../../../shared/common";
import type { NavigationItem } from "./NavBar";

const internalDocsItems: NavigationItem[] = [
  { name: "Security Guide", to: routes.SecurityTerminologyRoute.to },
];

const staticNavigationItems: NavigationItem[] = [
  { name: "External Docs", to: DocsUrl },
  { name: "Blog", to: BlogUrl },
];

export const marketingNavigationItems: NavigationItem[] = [
  { name: "Features", to: "/#features" },
  { name: "Pricing", to: routes.PricingPageRoute.to },
  ...internalDocsItems,
  ...staticNavigationItems,
] as const;

export const demoNavigationitems: NavigationItem[] = [
  ...internalDocsItems,
  ...staticNavigationItems,
] as const;
