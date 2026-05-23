import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Activity, TripPhoto } from '../data/types';
import { store, useStore } from '../store';

const MAX_TOTAL = 30;
const MAX_EDGE = 1280;
const JPEG_Q = 0.8;

async function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read fail'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('img fail'));
      img.onload = () => {
        const longEdge = Math.max(img.width, img.height);
        const scale = longEdge > MAX_EDGE ? MAX_EDGE / longEdge : 1;
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('ctx fail'));
        ctx.drawImage(img, 0, 0, w, h);
        try {
          resolve(canvas.toDataURL('image/jpeg', JPEG_Q));
        } catch (e) {
          reject(e);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function ActivityPhotos({ activity }: { activity: Activity }) {
  const allPhotos = useStore(s => s.photos);
  const participants = useStore(s => s.participants);
  const photos = allPhotos.filter(p => p.activityId === activity.id).sort((a,b) => a.ts - b.ts);
  const totalUsed = allPhotos.length;
  const nearLimit = totalUsed >= MAX_TOTAL - 5;
  const atLimit = totalUsed >= MAX_TOTAL;
  const inputRef = useRef<HTMLInputElement>(null);
  const [lightbox, setLightbox] = useState<TripPhoto | null>(null);
  const [editingCap, setEditingCap] = useState<string | null>(null);
  const [capText, setCapText] = useState('');

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      const dataUrl = await resizeImage(f);
      store.addPhoto(activity.id, dataUrl);
    } catch {
      alert('נכשלה טעינת התמונה');
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-ocean-100 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[13px] font-extrabold text-ocean-700">📸 התמונות שלנו ({photos.length})</div>
        {nearLimit && (
          <span className="text-[10px] font-bold text-sunset-700">{totalUsed}/{MAX_TOTAL}</span>
        )}
      </div>
      <div className="grid grid-cols-3 lg:grid-cols-4 gap-1.5">
        {photos.map(p => {
          const who = participants.find(x => x.id === p.who);
          return (
            <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden bg-ocean-50 group">
              <button onClick={() => setLightbox(p)} className="w-full h-full">
                <img src={p.dataUrl} alt={p.caption || ''} className="w-full h-full object-cover" />
              </button>
              {who && (
                <div className="absolute bottom-1 right-1 bg-black/55 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5">
                  {who.emoji} {who.name}
                </div>
              )}
              <button onClick={() => { setEditingCap(p.id); setCapText(p.caption || ''); }}
                      className="absolute top-1 left-1 bg-black/55 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5">
                ✎
              </button>
              {editingCap === p.id && (
                <div className="absolute inset-x-0 bottom-0 bg-white/95 p-1 flex gap-1">
                  <input value={capText} onChange={e => setCapText(e.target.value)}
                         placeholder="כיתוב…"
                         className="flex-1 text-[10px] rounded border border-ocean-100 px-1" />
                  <button onClick={() => { store.setPhotoCaption(p.id, capText); setEditingCap(null); }}
                          className="text-[10px] font-bold text-ocean-700">✓</button>
                </div>
              )}
            </div>
          );
        })}
        {!atLimit && (
          <button onClick={() => inputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-ocean-200 text-ocean-700 flex flex-col items-center justify-center text-2xl font-bold">
            +
            <span className="text-[10px] font-bold mt-0.5">הוסף</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" capture="environment"
             onChange={onFile} className="hidden" />
      {lightbox && createPortal(
        <div className="fixed inset-0 z-[110] bg-black/90 flex items-center justify-center"
             onClick={() => setLightbox(null)}>
          <img src={lightbox.dataUrl} alt="" className="max-w-full max-h-full" onClick={e => e.stopPropagation()} />
          <button onClick={() => setLightbox(null)}
                  className="absolute top-4 left-4 bg-white/15 text-white rounded-full px-3 py-1.5 text-sm font-bold">סגור ✕</button>
          <button onClick={() => { if (confirm('למחוק תמונה?')) { store.deletePhoto(lightbox.id); setLightbox(null); } }}
                  className="absolute bottom-4 right-4 bg-red-500 text-white rounded-full px-3 py-1.5 text-sm font-bold">🗑️ מחק</button>
          {lightbox.caption && (
            <div className="absolute bottom-4 left-4 right-24 bg-black/60 text-white text-[13px] rounded-xl px-3 py-2 text-center">
              {lightbox.caption}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
