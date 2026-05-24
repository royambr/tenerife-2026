import React, { useRef, useState } from 'react';
import type { Activity } from '../data/types';
import { CATEGORY_ICONS, STATUS_COLORS } from '../utils';
import { store, useEditMode, useStore } from '../store';
import { ActivityQuickActions } from './ActivityQuickActions';

export function ActivityCard({ a, onClick, compact=false, onReplace, swipeable=false }:{
  a: Activity; onClick?: () => void; compact?: boolean; onReplace?: (a: Activity) => void; swipeable?: boolean;
}) {
  const s = STATUS_COLORS[a.status];
  const edit = useEditMode();
  const participants = useStore(st => st.participants);
  const done = a.status === 'בוצע' || a.status === 'בוטל' || a.status === 'דולג';
  const [menu, setMenu] = useState(false);
  const cleanedName = a.name.replace(/^(חוף|טיול|הליכה|בוקר חוף|יום חוף)\s*·\s*/, '');
  const allIds = participants.map(p => p.id);
  const attendees = a.attendees ?? allIds;
  const partial = attendees.length < allIds.length;
  const attChips = partial
    ? attendees.slice(0, 3).map(id => participants.find(p => p.id === id)).filter(Boolean)
    : [];
  const extra = partial ? attendees.length - attChips.length : 0;

  // ---- swipe-to-delete state ----
  const TAP_THRESHOLD = 5;
  const DRAG_THRESHOLD = 80;
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [removing, setRemoving] = useState(false);
  const startRef = useRef<{ x: number; y: number; locked: 'none'|'h'|'v'; suppressTap: boolean } | null>(null);
  const swipeWrapperRef = useRef<HTMLDivElement>(null);

  function onPointerDown(e: React.PointerEvent) {
    if (!swipeable || removing) return;
    // only primary pointer
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    startRef.current = { x: e.clientX, y: e.clientY, locked: 'none', suppressTap: false };
    setDragging(true);
    try { (e.target as Element).setPointerCapture?.(e.pointerId); } catch {}
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!swipeable || !startRef.current) return;
    const ddx = e.clientX - startRef.current.x;
    const ddy = e.clientY - startRef.current.y;
    if (startRef.current.locked === 'none') {
      const ax = Math.abs(ddx), ay = Math.abs(ddy);
      if (ax < TAP_THRESHOLD && ay < TAP_THRESHOLD) return;
      // vertical scroll wins if y > 1.5 * x
      if (ay > ax * 1.5) {
        startRef.current.locked = 'v';
        setDragging(false);
        startRef.current = null;
        setDx(0);
        return;
      }
      startRef.current.locked = 'h';
      startRef.current.suppressTap = true;
    }
    if (startRef.current.locked !== 'h') return;
    // only allow swipe LEFT (negative x); clamp positive at 0
    const next = Math.min(0, ddx);
    setDx(next);
    if (Math.abs(next) >= DRAG_THRESHOLD) {
      // light haptic at threshold cross
      // (idempotent fire because we only call when crossing — guard with prev)
    }
  }
  const crossedRef = useRef(false);
  function onPointerMoveHaptic(e: React.PointerEvent) {
    if (!swipeable || !startRef.current || startRef.current.locked !== 'h') return;
    const ddx = e.clientX - startRef.current.x;
    const next = Math.min(0, ddx);
    const crossed = Math.abs(next) >= DRAG_THRESHOLD;
    if (crossed && !crossedRef.current) {
      try { navigator.vibrate?.(15); } catch {}
      crossedRef.current = true;
    } else if (!crossed && crossedRef.current) {
      crossedRef.current = false;
    }
  }
  function onPointerUp(e: React.PointerEvent) {
    if (!swipeable || !startRef.current) { setDragging(false); return; }
    const wasH = startRef.current.locked === 'h';
    const ddx = e.clientX - startRef.current.x;
    const final = Math.min(0, ddx);
    startRef.current = null;
    setDragging(false);
    crossedRef.current = false;
    if (!wasH) { setDx(0); return; }
    if (Math.abs(final) >= DRAG_THRESHOLD) {
      // commit delete with fade
      setRemoving(true);
      // slide off + fade
      setDx(-Math.max(Math.abs(final), 400));
      setTimeout(() => {
        store.deleteActivity(a.id);
        // reset (in case undone reinstates this card instance — though new render happens)
        setRemoving(false);
        setDx(0);
      }, 200);
    } else {
      // spring back
      setDx(0);
    }
  }
  function onPointerCancel() {
    startRef.current = null;
    setDragging(false);
    crossedRef.current = false;
    setDx(0);
  }

  function handleClick() {
    // suppress tap if a horizontal drag happened
    if (dx !== 0) return;
    onClick?.();
  }

  const cardInner = (
    <div className={`relative group w-full rounded-2xl bg-white border
        ${edit ? 'border-volcano-900/40' : 'border-ocean-100/50'}
        ${done ? 'opacity-55' : ''} ${!dragging && !removing ? 'active:scale-[.99]' : ''}`}
      style={{
        transform: `translateX(${dx}px)`,
        transition: dragging ? 'none' : 'transform 200ms cubic-bezier(.2,.8,.2,1), opacity 200ms ease',
        opacity: removing ? 0 : 1,
        touchAction: swipeable ? 'pan-y' : undefined,
      }}>
      <button
        onClick={handleClick}
        type="button"
        aria-label={a.name}
        className="w-full text-right"
      >
        <div className="flex items-stretch">
          <div className={`w-1 rounded-r-2xl ${s.dot}`} />
          <div className="flex-1 p-3 min-w-0">
            <div className="flex items-start gap-2.5">
              {/* time range pill on the LEFT (visual leading edge in RTL) */}
              <div className="flex-shrink-0 flex flex-col items-center gap-1">
                <span className="text-[11px] font-extrabold tabular-nums bg-ocean-50 text-ocean-700 rounded-lg px-2 py-1 leading-none whitespace-nowrap">
                  {a.startTime}<span className="opacity-50 mx-0.5">–</span>{a.endTime}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-1.5">
                  <span className="text-xl leading-none flex-shrink-0">{CATEGORY_ICONS[a.category]}</span>
                  <div className="text-[14px] font-semibold text-ocean-700 leading-snug break-words"
                       style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {cleanedName}
                  </div>
                </div>
                {partial && (
                  <div className="mt-1.5 flex items-center gap-0.5 text-[10px] text-zinc-500">
                    {attChips.map(p => (
                      <span key={p!.id} className="bg-sand-100 rounded-full w-5 h-5 flex items-center justify-center" title={p!.name}>
                        {p!.emoji}
                      </span>
                    ))}
                    {extra > 0 && <span className="bg-sand-100 rounded-full w-5 h-5 flex items-center justify-center font-bold">+{extra}</span>}
                    <span className="mr-1 font-semibold">{attendees.length}/{allIds.length}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </button>
      {edit && (
        <button onClick={(e) => { e.stopPropagation(); setMenu(true); }}
                aria-label="פעולות מהירות"
                className="absolute top-1.5 left-1.5 w-8 h-8 rounded-full bg-volcano-900 text-white text-base font-bold flex items-center justify-center">
          ⋮
        </button>
      )}
      {(a.messages?.length || 0) > 0 && (
        <span className="absolute top-1.5 left-1.5 text-[10px] font-extrabold bg-sunset-500 text-white rounded-full px-1.5 py-0.5 pointer-events-none"
              style={edit ? { top: '40px' } : undefined}>
          💬 {a.messages!.length}
        </span>
      )}
    </div>
  );

  if (!swipeable) {
    return (
      <>
        {cardInner}
        {menu && (
          <ActivityQuickActions activity={a} open={menu} onClose={() => setMenu(false)} onReplace={onReplace} />
        )}
      </>
    );
  }

  // swipeable wrapper with red "מחק" pill behind
  const revealAmount = Math.min(Math.abs(dx), 160);
  const reachedThreshold = Math.abs(dx) >= DRAG_THRESHOLD;
  return (
    <>
      <div
        ref={swipeWrapperRef}
        className="relative overflow-hidden rounded-2xl"
        onPointerDown={onPointerDown}
        onPointerMove={(e) => { onPointerMove(e); onPointerMoveHaptic(e); }}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        aria-label="החלק שמאלה למחיקה"
      >
        {/* red action behind */}
        <div
          className={`absolute inset-y-0 left-0 flex items-center justify-start pl-4
                      pointer-events-none transition-colors
                      ${reachedThreshold ? 'bg-red-600' : 'bg-red-500/85'}`}
          style={{ width: `${revealAmount}px`, opacity: revealAmount > 0 ? 1 : 0 }}
          aria-hidden
        >
          <span className="text-white text-[13px] font-extrabold flex items-center gap-1.5">
            <span className="text-base leading-none">🗑️</span> מחק
          </span>
        </div>
        {cardInner}
      </div>
      {menu && (
        <ActivityQuickActions activity={a} open={menu} onClose={() => setMenu(false)} onReplace={onReplace} />
      )}
    </>
  );
}
