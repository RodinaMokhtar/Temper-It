import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  X,
  Bell
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  timestamp: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id' | 'timestamp'>) => string;
  dismissToast: (id: string) => void;
  success: (title: string, message?: string, duration?: number) => string;
  error: (title: string, message?: string, duration?: number) => string;
  info: (title: string, message?: string, duration?: number) => string;
  warning: (title: string, message?: string, duration?: number) => string;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4000, action }: Omit<ToastItem, 'id' | 'timestamp'>) => {
      const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const newToast: ToastItem = {
        id,
        type,
        title,
        message,
        duration,
        timestamp: Date.now(),
        action,
      };

      setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // Keep max 5 toasts visible

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

  const success = useCallback(
    (title: string, message?: string, duration?: number) =>
      showToast({ type: 'success', title, message, duration }),
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string, duration?: number) =>
      showToast({ type: 'error', title, message, duration }),
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string, duration?: number) =>
      showToast({ type: 'info', title, message, duration }),
    [showToast]
  );

  const warning = useCallback(
    (title: string, message?: string, duration?: number) =>
      showToast({ type: 'warning', title, message, duration }),
    [showToast]
  );

  const value = useMemo(
    () => ({
      toasts,
      showToast,
      dismissToast,
      success,
      error,
      info,
      warning,
    }),
    [toasts, showToast, dismissToast, success, error, info, warning]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Visual Toast Item Component with progress bar and hover-pause
interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <aside
      aria-label="إشعارات النظام"
      aria-live="polite"
      className="fixed bottom-16 md:bottom-5 left-4 md:left-5 z-[99999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] md:w-auto pointer-events-none"
      dir="rtl"
    >
      {toasts.map((toast) => (
        <SingleToast key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </aside>
  );
};

interface SingleToastProps {
  toast: ToastItem;
  onDismiss: () => void;
}

const SingleToast: React.FC<SingleToastProps> = ({ toast, onDismiss }) => {
  const [isHovered, setIsHovered] = useState(false);

  const styleConfig = {
    success: {
      border: 'border-emerald-500/40',
      bg: 'bg-white/95 backdrop-blur-md shadow-emerald-500/10',
      glow: 'from-emerald-500/10 to-transparent',
      bar: 'bg-emerald-500',
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-100 text-emerald-700',
      titleColor: 'text-emerald-950',
      Icon: CheckCircle2,
    },
    error: {
      border: 'border-rose-500/40',
      bg: 'bg-white/95 backdrop-blur-md shadow-rose-500/10',
      glow: 'from-rose-500/10 to-transparent',
      bar: 'bg-rose-500',
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-100 text-rose-700',
      titleColor: 'text-rose-950',
      Icon: AlertCircle,
    },
    warning: {
      border: 'border-amber-500/40',
      bg: 'bg-white/95 backdrop-blur-md shadow-amber-500/10',
      glow: 'from-amber-500/10 to-transparent',
      bar: 'bg-amber-500',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100 text-amber-700',
      titleColor: 'text-amber-950',
      Icon: AlertTriangle,
    },
    info: {
      border: 'border-sky-500/40',
      bg: 'bg-white/95 backdrop-blur-md shadow-sky-500/10',
      glow: 'from-sky-500/10 to-transparent',
      bar: 'bg-sky-600',
      iconColor: 'text-sky-600',
      iconBg: 'bg-sky-100 text-sky-700',
      titleColor: 'text-sky-950',
      Icon: Info,
    },
  }[toast.type];

  const { Icon } = styleConfig;
  const duration = toast.duration || 4000;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border ${styleConfig.border} ${styleConfig.bg} shadow-xl transition-all duration-300 transform translate-y-0 opacity-100 hover:scale-[1.01]`}
      style={{
        animation: 'slideUpFade 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Decorative subtle ambient gradient */}
      <div className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r ${styleConfig.glow}`} />

      <div className="p-4 flex items-start gap-3">
        {/* Type Icon */}
        <div
          className={`w-9 h-9 rounded-xl ${styleConfig.iconBg} flex items-center justify-center shrink-0 shadow-xs mt-0.5`}
        >
          <Icon className="w-5 h-5 stroke-[2.2]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-0.5 text-right">
          <div className="flex items-center justify-between gap-2">
            <h4 className={`text-xs sm:text-sm font-black ${styleConfig.titleColor} leading-tight`}>
              {toast.title}
            </h4>
            <span className="text-[10px] font-mono text-slate-400 shrink-0">الآن</span>
          </div>

          {toast.message && (
            <p className="text-[11px] sm:text-xs text-slate-600 mt-1 leading-relaxed break-words font-medium">
              {toast.message}
            </p>
          )}

          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action?.onClick();
                onDismiss();
              }}
              className="mt-2 text-xs font-bold text-sky-700 hover:text-sky-900 underline inline-block cursor-pointer"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-600 p-1 -mr-1 rounded-lg hover:bg-slate-100 transition cursor-pointer shrink-0"
          title="إغلاق الإشعار"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar (countdown) */}
      {duration > 0 && (
        <div className="w-full bg-slate-100 h-1 overflow-hidden">
          <div
            className={`h-full ${styleConfig.bar}`}
            style={{
              width: '100%',
              animation: `shrinkWidth ${duration}ms linear forwards`,
              animationPlayState: isHovered ? 'paused' : 'running',
            }}
          />
        </div>
      )}
    </div>
  );
};
