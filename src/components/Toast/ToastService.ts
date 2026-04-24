export type ToastType = "success" | "error" | "warning" | "info";
export type ToastPosition = "top" | "bottom";

export interface ToastOptions {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // По умолчанию 3000 мс
  position?: ToastPosition; // По умолчанию "top"
}

type ToastListener = (options: ToastOptions) => void;

class ToastManager {
  private listener: ToastListener | null = null;

  // Компонент ToastRoot подпишется через этот метод при монтировании
  setListener(listener: ToastListener) {
    this.listener = listener;
  }

  // ЭТОТ МЕТОД МЫ БУДЕМ ВЫЗЫВАТЬ ИЗ КОДА
  show(options: ToastOptions) {
    if (this.listener) {
      this.listener(options);
    } else {
      console.warn(
        "ToastManager: listener is not set. Did you mount <ToastRoot />?",
      );
    }
  }

  // Хелперы для быстрого вызова
  success(title: string, message?: string, position?: ToastPosition) {
    this.show({ type: "success", title, message, position });
  }

  error(title: string, message?: string, position?: ToastPosition) {
    this.show({ type: "error", title, message, position });
  }

  warning(title: string, message?: string, position?: ToastPosition) {
    this.show({ type: "warning", title, message, position });
  }

  info(title: string, message?: string, position?: ToastPosition) {
    this.show({ type: "info", title, message, position });
  }
}

export const Toast = new ToastManager();
