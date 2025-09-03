import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SharedData } from '@/types';
import toast, { Toaster } from 'react-hot-toast';

/**
 * Flash Messages Component
 *
 * Displays flash messages from Laravel session
 * Automatically dismisses after a timeout
 * Supports success, error, warning, and info types
 */

interface FlashMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  id: string;
}

export default function FlashMessages() {
  const { flash } = usePage<SharedData>().props;
  const [messages, setMessages] = useState<FlashMessage[]>([]);



  useEffect(() => {
    const newMessages: FlashMessage[] = [];

    // Convert flash data to message objects
    if (flash?.success) {
      newMessages.push({
        type: 'success',
        message: flash.success,
        id: `success-${Date.now()}`
      });
    }

    if (flash?.error) {
      newMessages.push({
        type: 'error',
        message: flash.error,
        id: `error-${Date.now()}`
      });
    }

    if (flash?.warning) {
      newMessages.push({
        type: 'warning',
        message: flash.warning,
        id: `warning-${Date.now()}`
      });
    }

    if (flash?.info) {
      newMessages.push({
        type: 'info',
        message: flash.info,
        id: `info-${Date.now()}`
      });
    }

    if (newMessages.length > 0) {
      setMessages(newMessages);

      // Auto-dismiss messages after 6 seconds
      const timer = setTimeout(() => {
        setMessages([]);
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [flash]);

  const dismissMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  if (messages.length === 0) {
    return null;
  }

  const getIcon = (type: FlashMessage['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <XCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
    }
  };

  const getVariant = (type: FlashMessage['type']) => {
    switch (type) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'info':
        return 'default';
    }
  };

  const getColorClasses = (type: FlashMessage['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-200/60 bg-green-50/90 text-green-900 dark:border-green-700/60 dark:bg-green-950/90 dark:text-green-100 [&_svg]:text-green-600 dark:[&_svg]:text-green-400';
      case 'error':
        return 'border-red-200/60 bg-red-50/90 text-red-900 dark:border-red-700/60 dark:bg-red-950/90 dark:text-red-100 [&_svg]:text-red-600 dark:[&_svg]:text-red-400';
      case 'warning':
        return 'border-amber-200/60 bg-amber-50/90 text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/90 dark:text-amber-100 [&_svg]:text-amber-600 dark:[&_svg]:text-amber-400';
      case 'info':
        return 'border-blue-200/60 bg-blue-50/90 text-blue-900 dark:border-blue-700/60 dark:bg-blue-950/90 dark:text-blue-100 [&_svg]:text-blue-600 dark:[&_svg]:text-blue-400';
    }
  };

  return (
    <>


      {/* Laravel Flash Messages */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'relative rounded-lg border p-4 shadow-lg backdrop-blur-sm',
              'animate-in slide-in-from-right-full duration-300',
              'transition-all hover:shadow-xl',
              getColorClasses(message.type)
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(message.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-5">
                  {message.message}
                </p>
              </div>
              <button
                onClick={() => dismissMessage(message.id)}
                className={cn(
                  'flex-shrink-0 ml-2 p-1 rounded-md transition-colors',
                  'hover:bg-black/10 dark:hover:bg-white/10',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent'
                )}
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* React Hot Toast Container - Simplified for debugging */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerStyle={{
          top: '20px',
          right: '20px',
          zIndex: 9999,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#10b981',
            color: '#ffffff',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500',
            minWidth: '250px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          },
        }}
      />
    </>
  );
}

// Hook for programmatically showing flash messages
export function useFlashMessage() {
  const showSuccess = (message: string) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#10b981',
        color: '#ffffff',
        borderRadius: '8px',
        padding: '12px 16px',
      },
      iconTheme: {
        primary: '#ffffff',
        secondary: '#10b981',
      },
    });
  };

  const showError = (message: string) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
      style: {
        background: '#ef4444',
        color: '#ffffff',
        borderRadius: '8px',
        padding: '12px 16px',
      },
      iconTheme: {
        primary: '#ffffff',
        secondary: '#ef4444',
      },
    });
  };

  const showWarning = (message: string) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: '#f59e0b',
        color: '#ffffff',
        borderRadius: '8px',
        padding: '12px 16px',
      },
    });
  };

  const showInfo = (message: string) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        background: '#3b82f6',
        color: '#ffffff',
        borderRadius: '8px',
        padding: '12px 16px',
      },
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
}
