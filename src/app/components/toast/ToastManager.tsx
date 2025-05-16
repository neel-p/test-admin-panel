// components/ToastManager.tsx
"use client";
import { Toast } from "flowbite-react";
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { HiCheck, HiExclamation, HiX } from "react-icons/hi";

type ToastType = "success" | "error" | "warning";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdRef = useRef(0);

  const showToast = (message: string, type: ToastType = "success") => {
    const id = `toast-${toastIdRef.current++}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const timers = toasts.map((toast) => {
      const timer = setTimeout(() => {
        removeToast(toast.id);
      }, 4000);
      return timer;
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [toasts]);

  const getToastStyle = (type: ToastType) => {
    switch (type) {
      case "success":
        return {
          icon: <HiCheck className="h-5 w-5" />,
          classes:
            "bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200",
        };
      case "error":
        return {
          icon: <HiX className="h-5 w-5" />,
          classes: "bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200",
        };
      case "warning":
        return {
          icon: <HiExclamation className="h-5 w-5" />,
          classes:
            "bg-orange-100 text-orange-500 dark:bg-orange-700 dark:text-orange-200",
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-4">
        {toasts.map((toast) => {
          const style = getToastStyle(toast.type);
          return (
            <Toast key={toast.id}>
              <div
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${style.classes}`}
              >
                {style.icon}
              </div>
              <div className="ml-3 text-sm font-normal">{toast.message}</div>
              <Toast.Toggle onDismiss={() => removeToast(toast.id)} />
            </Toast>
          );
        })}
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
