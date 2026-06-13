"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Global dispatcher ref to allow triggering toasts from non-React files (e.g. api.ts)
let globalAddToast: ((type: ToastType, message: string, duration?: number) => void) | null = null;

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, message, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  // Expose to global dispatcher
  React.useEffect(() => {
    globalAddToast = addToast;
    return () => {
      globalAddToast = null;
    };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* Toast Portal Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// Static helper to invoke toasts outside React components
export const toast = {
  success: (message: string, duration?: number) => {
    if (globalAddToast) globalAddToast("success", message, duration);
  },
  error: (message: string, duration?: number) => {
    if (globalAddToast) globalAddToast("error", message, duration);
  },
  warning: (message: string, duration?: number) => {
    if (globalAddToast) globalAddToast("warning", message, duration);
  },
  info: (message: string, duration?: number) => {
    if (globalAddToast) globalAddToast("info", message, duration);
  },
};

// Internal Toast Card Component
const ToastCard: React.FC<{ toast: ToastItem; onClose: () => void }> = ({ toast, onClose }) => {
  const { type, message } = toast;

  const bgStyles = {
    success: "bg-surface-container-lowest border-success/30 text-[#28A745] shadow-lg shadow-success/5",
    error: "bg-surface-container-lowest border-error/30 text-error shadow-lg shadow-error/5",
    warning: "bg-surface-container-lowest border-warning/30 text-[#D4A017] shadow-lg shadow-warning/5",
    info: "bg-surface-container-lowest border-secondary/30 text-secondary shadow-lg shadow-secondary/5",
  };

  const icons = {
    success: (
      <svg className="h-5 w-5 text-success" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5 text-error" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5 text-warning" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 border rounded-lg max-w-sm w-full transition-all duration-300 transform translate-y-0 scale-100 animate-slide-in ${bgStyles[type]}`}
      role="alert"
    >
      <span className="flex-shrink-0 mt-0.5">{icons[type]}</span>
      <div className="flex-1 text-body-sm font-semibold text-on-surface leading-tight">
        {message}
      </div>
      <button
        onClick={onClose}
        className="text-on-surface-variant/60 hover:text-on-surface p-0.5 rounded-default transition-all flex items-center justify-center cursor-pointer"
        aria-label="Close notification"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
