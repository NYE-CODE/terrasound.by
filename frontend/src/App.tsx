import { lazy, Suspense } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";

const AppToaster = lazy(() => import("./components/AppToaster"));

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Suspense fallback={null}>
        <AppToaster />
      </Suspense>
    </>
  );
}
