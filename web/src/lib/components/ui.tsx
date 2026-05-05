import { useEffect, useCallback, type ReactNode } from 'react';
import { X } from 'lucide-react';

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`w-8 h-8 border-2 border-[#FF6900] border-t-transparent rounded-full animate-spin ${className}`} />
  );
}

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/8 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-neutral-400 uppercase tracking-wide">{label}</label>
      {children}
      {error && <p className="text-[11px] text-rose-400">{error}</p>}
    </div>
  );
}

export const inputCls =
  'w-full px-3 py-2.5 bg-[#121212] border border-white/8 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#FF6900]/60 focus:ring-1 focus:ring-[#FF6900]/30 transition-colors';

export function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
      <p className="text-sm text-rose-400">{message}</p>
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center">
      <Spinner />
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
        <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-white">Errore nel caricamento</p>
        <p className="text-xs text-neutral-500 mt-1">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="text-xs text-[#FF6900] hover:text-white transition-colors underline underline-offset-2"
      >
        Riprova
      </button>
    </div>
  );
}

export function EmptyState({
  message,
  action,
  onAction,
}: {
  message: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-white/4 border border-white/8 flex items-center justify-center">
        <svg className="w-6 h-6 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-white">{message}</p>
      </div>
      {action && onAction && (
        <button
          onClick={onAction}
          className="text-xs text-[#FF6900] hover:text-white transition-colors underline underline-offset-2"
        >
          {action}
        </button>
      )}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl bg-[#09090B] border border-white/8 min-h-52 animate-pulse">
      <div className="p-7 space-y-4">
        <div className="flex justify-between items-center">
          <div className="w-10 h-10 rounded-full bg-white/5" />
          <div className="h-5 w-14 bg-white/5 rounded" />
        </div>
        <div className="h-6 w-3/4 bg-white/5 rounded" />
        <div className="h-3 w-1/2 bg-white/5 rounded" />
      </div>
    </div>
  );
}

export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col rounded-xl border border-white/8 bg-[#09090B] overflow-hidden">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-12 items-center px-6 py-4 border-b border-white/4 last:border-0 animate-pulse">
          <div className="col-span-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/5" />
            <div className="h-4 bg-white/5 rounded w-32" />
          </div>
          <div className="col-span-4 h-3 bg-white/5 rounded w-40" />
          <div className="col-span-2 h-5 bg-white/5 rounded w-16" />
          <div className="col-span-2 flex justify-end">
            <div className="h-8 w-8 bg-white/5 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
        transition-colors duration-300 ease-in-out focus:outline-none
        ${checked ? 'bg-[#FF6900]' : 'bg-white/10 hover:bg-white/20'}
      `}
    >
      <span className={`absolute inset-0 rounded-full transition-opacity duration-300 ${checked ? 'opacity-100 shadow-[0_0_12px_rgba(255,105,0,0.5)]' : 'opacity-0'}`} />
      <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-sm ring-0 transition duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}
