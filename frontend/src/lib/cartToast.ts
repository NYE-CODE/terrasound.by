import { toast } from "sonner";

export function toastAddedToCart() {
  toast.success("Добавлено в корзину", {
    action: {
      label: "Перейти в корзину",
      onClick: () => {
        void import("../routes").then(({ router }) => {
          void router.navigate("/cart");
        });
      },
    },
  });
}
