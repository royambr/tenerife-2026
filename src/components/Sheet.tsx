import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export function Sheet({ open, onClose, children, title }:{
  open: boolean; onClose: () => void; children: React.ReactNode; title?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center lg:items-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet body */}
      <div
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        className="
          relative w-full max-w-md
          max-h-[92vh] lg:max-h-[85vh]
          overflow-y-auto
          rounded-t-3xl lg:rounded-3xl
          bg-white shadow-2xl
          animate-sheet-in lg:animate-modal-in
          mb-0 lg:mb-0
          mx-0 lg:mx-4
        "
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur z-10 px-5 pt-3 pb-2 border-b border-ocean-100/60">
          <div className="lg:hidden mx-auto w-12 h-1.5 rounded-full bg-zinc-200 mb-2" />
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[16px] lg:text-[18px] font-bold text-ocean-700 truncate">{title}</h3>
            <button
              onClick={onClose}
              aria-label="סגור"
              className="text-zinc-500 text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-zinc-100 flex-shrink-0"
            >
              סגור ✕
            </button>
          </div>
        </div>
        <div className="p-5 pb-8">{children}</div>
      </div>
    </div>,
    document.body
  );
}
