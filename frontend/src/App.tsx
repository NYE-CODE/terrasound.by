import { lazy, Suspense } from "react";
import { RouterProvider } from "react-router";
import { lazyRoute } from "./lib/lazyRoute";
import { router } from "./routes";

const AppToaster = lazyRoute(() => import("./components/AppToaster"));

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
