export interface AlertButton {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
}

export interface AlertOptions {
  title: string;
  message?: string;
  buttons?: AlertButton[];
  cancelable?: boolean;
}

type AlertListener = (options: AlertOptions) => void;

class AlertManager {
  private listener: AlertListener | null = null;

  setListener(listener: AlertListener) {
    this.listener = listener;
  }

  show(options: AlertOptions) {
    if (this.listener) {
      this.listener(options);
    } else {
      console.warn(
        "AlertManager: listener is not set. Did you mount <AlertRoot />?",
      );
    }
  }

  alert(
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: { cancelable?: boolean },
  ) {
    this.show({
      title,
      message,
      buttons,
      cancelable: options?.cancelable,
    });
  }
}

export const AlertDialog = new AlertManager();
