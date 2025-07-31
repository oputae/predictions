'use client';

import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  title: string;
  description?: string;
  status: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

export function Toast({ title, description, status, onClose }: ToastProps) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    info: <AlertCircle className="w-5 h-5 text-blue-400" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-400" />,
  };

  const bgColors = {
    success: 'bg-green-900',
    error: 'bg-red-900',
    info: 'bg-blue-900',
    warning: 'bg-yellow-900',
  };

  return (
    <div className={`${bgColors[status]} rounded-lg p-4 min-w-[300px] animate-slide-in relative`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">{icons[status]}</div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-white">{title}</p>
          {description && (
            <p className="mt-1 text-sm text-gray-300">{description}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="ml-4 flex-shrink-0 text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white hover:bg-opacity-10 cursor-pointer"
          type="button"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}