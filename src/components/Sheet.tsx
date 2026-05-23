import React, { useEffect } from 'react';

export function Sheet({ open, onClose, children, title }:{
  open: boolean; onClose: () => void; children: React.ReactNode; title?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 backdrop animate-fade-up" onClick={onClose} />
      <div
        dir="rtl"
        className="relative w-full max-w-md max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl animate-sheet-in"
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur z-10 px-5 pt-3 pb-2 border-b border-ocean-100/60">
          <div className="mx-auto w-12 h-1.5 rounded-full bg-zinc-200 mb-2" />
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-ocean-700">{title}</h3>
            <button onClick={onClose} className="text-zinc-500 text-sm font-semibold px-2 py-1 rounded-lg hover:bg-zinc-100">סגור</button>
          </div>
        </div>
        <div className="p-5 pb-8">{children}</div>
      </div>
    </div>
  );
}
