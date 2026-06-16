import { Toaster } from "sonner";

export default function AppToaster() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#181818",
          border: "1px solid #2A2A2A",
          color: "#F0EDE8",
          fontFamily: '"Golos Text", sans-serif',
        },
        className: "font-heading",
      }}
    />
  );
}
