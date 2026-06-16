import { toastSuccess } from "./lazyToast";

export function toastAddedToCart() {
  void toastSuccess("Добавлено в корзину", {
    action: {
      label: "Перейти в корзину",
      onClick: () => {
        window.location.assign("/cart");
      },
    },
  });
}
