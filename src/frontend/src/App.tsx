import { Layout } from "@/components/Layout";
import Home from "@/pages/Home";
import ListingForm from "@/pages/ListingForm";
import ProductDetail from "@/pages/ProductDetail";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
    category: typeof search.category === "string" ? search.category : "",
  }),
  component: Home,
});

const listingFormRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/listings/new",
  component: ListingForm,
});

const listingEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/listings/$id/edit",
  component: ListingForm,
});

const productDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/listings/$id",
  component: ProductDetail,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  listingFormRoute,
  listingEditRoute,
  productDetailRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
