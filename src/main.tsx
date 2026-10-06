import { StrictMode, Suspense, lazy, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./index.css";
import HomePage from "@/pages/public/HomePage";
import OfficePage from "@/pages/public/OfficePage";
import BuildingPage from "@/pages/public/BuildingPage";
import NotFoundPage from "@/pages/public/NotFoundPage";
import { AuthRoot, RequireRole } from "@/auth/AuthContext";
import { Spinner } from "@/components/ui";

// The back office ships as its own chunk; door pages stay light on mobile data.
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
const OverviewPage = lazy(() => import("@/pages/admin/OverviewPage"));
const PlaquesPage = lazy(() => import("@/pages/admin/PlaquesPage"));
const SpacesPage = lazy(() => import("@/pages/admin/SpacesPage"));
const SpaceEditorPage = lazy(() => import("@/pages/admin/SpaceEditorPage"));
const BuildingsPage = lazy(() => import("@/pages/admin/BuildingsPage"));
const BuildingEditorPage = lazy(() => import("@/pages/admin/BuildingEditorPage"));
const UsersPage = lazy(() => import("@/pages/admin/UsersPage"));
const AccountPage = lazy(() => import("@/pages/admin/AccountPage"));

const fallback = (
  <div className="grid min-h-[50dvh] place-items-center">
    <Spinner label="Φόρτωση…" />
  </div>
);
const s = (el: ReactNode) => <Suspense fallback={fallback}>{el}</Suspense>;

const router = createBrowserRouter(
  [
    { path: "/", element: <HomePage /> },
    { path: "/o/:slug", element: <OfficePage /> },
    { path: "/b/:slug", element: <BuildingPage /> },
    {
      element: <AuthRoot />,
      children: [
        { path: "/login", element: s(<LoginPage />) },
        {
          path: "/admin",
          element: s(
            <RequireRole>
              <AdminLayout />
            </RequireRole>,
          ),
          children: [
            { index: true, element: s(<OverviewPage />) },
            { path: "plaques", element: s(<PlaquesPage />) },
            { path: "account", element: s(<AccountPage />) },
            { path: "spaces", element: s(<RequireRole roles={["admin"]}><SpacesPage /></RequireRole>) },
            { path: "spaces/:id", element: s(<RequireRole roles={["admin"]}><SpaceEditorPage /></RequireRole>) },
            { path: "buildings", element: s(<RequireRole roles={["admin"]}><BuildingsPage /></RequireRole>) },
            { path: "buildings/:id", element: s(<RequireRole roles={["admin"]}><BuildingEditorPage /></RequireRole>) },
            { path: "users", element: s(<RequireRole roles={["admin"]}><UsersPage /></RequireRole>) },
          ],
        },
      ],
    },
    { path: "*", element: <NotFoundPage /> },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" },
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
