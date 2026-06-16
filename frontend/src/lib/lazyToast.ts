type SonnerModule = typeof import("sonner");

let sonnerModule: Promise<SonnerModule> | null = null;

function loadSonner(): Promise<SonnerModule> {
  sonnerModule ??= import("sonner");
  return sonnerModule;
}

export async function toastError(message: string): Promise<void> {
  const { toast } = await loadSonner();
  toast.error(message);
}

export async function toastSuccess(
  message: string,
  options?: Parameters<SonnerModule["toast"]["success"]>[1],
): Promise<void> {
  const { toast } = await loadSonner();
  toast.success(message, options);
}
