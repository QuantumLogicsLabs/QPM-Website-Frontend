import { createBrowserRouter } from "react-router";
import NotFound from "@/pages/NotFound/NotFound";
import PageLoader from "./PageLoader";
import RootLayout from "./RootLayout";
import RouteError from "./RouteError";

/** Each page is code-split into its own chunk and loaded on first visit. */
const page = (load) => async () => {
  const { default: Component } = await load();
  return { Component };
};

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    ErrorBoundary: RouteError,
    children: [
      {
        // Pathless wrapper: page errors and the first chunk load render
        // inside the layout, so the navbar and footer stay put.
        ErrorBoundary: RouteError,
        HydrateFallback: PageLoader,
        children: [
          { index: true, lazy: page(() => import("@/pages/Home/Home")) },
          { path: "explore", lazy: page(() => import("@/pages/Explore/Explore")) },
          { path: "package/:name", lazy: page(() => import("@/pages/PackageDetails/PackageDetails")) },
          { path: "publish", lazy: page(() => import("@/pages/Publish/Publish")) },
          { path: "profile", lazy: page(() => import("@/pages/Profile/Profile")) },
          { path: "*", Component: NotFound },
        ],
      },
    ],
  },
]);
