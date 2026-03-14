// Sistema de notificações com console.log para simplicidade
// Em produção, recomenda-se usar react-hot-toast ou similar

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  timestamp: number;
}

class ToastManager {
  private toasts: Toast[] = [];
  private listeners: Array<(toasts: Toast[]) => void> = [];

  private notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  success(message: string): string {
    console.log("✅ SUCCESS:", message);
    return this.addToast(message, "success");
  }

  error(message: string): string {
    console.error("❌ ERROR:", message);
    return this.addToast(message, "error");
  }

  warning(message: string): string {
    console.warn("⚠️ WARNING:", message);
    return this.addToast(message, "warning");
  }

  info(message: string): string {
    console.info("ℹ️ INFO:", message);
    return this.addToast(message, "info");
  }

  private addToast(message: string, type: ToastType): string {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const toast: Toast = {
      id,
      message,
      type,
      timestamp: Date.now(),
    };

    this.toasts.push(toast);
    this.notify();

    // Auto remove após 5 segundos
    setTimeout(() => {
      this.removeToast(id);
    }, 5000);

    return id;
  }

  removeToast(id: string): void {
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    this.notify();
  }

  removeAll(): void {
    this.toasts = [];
    this.notify();
  }

  getToasts(): Toast[] {
    return [...this.toasts];
  }

  subscribe(listener: (toasts: Toast[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}

// Singleton instance - EXPORT DEFAULT ADICIONADO
const toastManager = new ToastManager();

// Named exports
export const toast = toastManager;
export default toastManager;

// Hook para usar no React (opcional)
export const useToast = () => {
  return {
    success: toast.success.bind(toast),
    error: toast.error.bind(toast),
    warning: toast.warning.bind(toast),
    info: toast.info.bind(toast),
  };
};
