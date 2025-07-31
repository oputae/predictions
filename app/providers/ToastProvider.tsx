'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Toast } from '@/app/components/shared/Toast';

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  status: 'success' | 'error' | 'info' | 'warning';
  timestamp: number;
}

interface ToastContextType {
  toast: (message: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
});

export const useToast = () => useContext(ToastContext);

const MAX_TOASTS = 3; // Maximum number of toasts to show at once
const DEDUPLICATION_WINDOW = 2000; // Don't show same message within 2 seconds

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((message: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    const now = Date.now();
    const id = `${now}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast = { ...message, id, timestamp: now };
    
    setToasts((prev) => {
      // Check for duplicate messages within the deduplication window
      const isDuplicate = prev.some(t => 
        t.title === message.title && 
        t.description === message.description &&
        (now - t.timestamp) < DEDUPLICATION_WINDOW
      );
      
      if (isDuplicate) {
        return prev; // Don't add duplicate
      }
      
      // Limit to maximum number of toasts
      const updatedToasts = [...prev, newToast];
      if (updatedToasts.length > MAX_TOASTS) {
        return updatedToasts.slice(-MAX_TOASTS); // Keep only the latest ones
      }
      
      return updatedToasts;
    });
    
    // Auto-remove after shorter duration for less important messages
    const duration = message.status === 'error' ? 6000 : 
                    message.status === 'success' ? 4000 : 
                    message.status === 'info' ? 3000 : 4000;
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-[9999] pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              {...toast}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}