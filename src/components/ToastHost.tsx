import React from 'react';
import { createPortal } from 'react-dom';
import { useToasts, store, toastStore } from '../store';

export function ToastHost() {
  const toasts = useToasts();
  if (toasts.length === 0) return null;
  return createPortal(
    <div dir="rtl" className="fixed inset-x-0 bottom-24 lg:bottom-6 z-[200] flex flex-col items-center gap-2 pointer-events-none px-3">
      {toasts.map(t => (
        <div key={t.id}
             className="pointer-events-auto bg-volcano-900 text-white rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-3 max-w-md w-full animate-fade-up">
          <span className="text-[13px] font-bold flex-1 truncate">{t.text}</span>
          {t.undoId && (
            <button onClick={() => { store.undo(t.undoId!); toastStore.dismiss(t.id); }}
                    className="text-[12px] font-extrabold bg-white/20 rounded-full px-3 py-1 hover:bg-white/30">
              בטל
            </button>
          )}
          <button onClick={() => toastStore.dismiss(t.id)}
                  aria-label="סגור" className="text-white/80 text-xs px-1">✕</button>
        </div>
      ))}
    </div>,
    document.body
  );
}
