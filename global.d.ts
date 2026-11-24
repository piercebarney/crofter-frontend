declare global {
  interface Window {
    isAppInstalled?: boolean;
  }

  interface Navigator {
    standalone?: boolean;
  }
}

export {};
