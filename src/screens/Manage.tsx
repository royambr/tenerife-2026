import React, { useState } from 'react';
import { useStore, store } from '../store';
import { Chip } from '../components/Chip';
import { Sheet } from '../components/Sheet';
import type { ChecklistItem, Decision } from '../data/types';
import { PROFILES } from '../data/profiles';
import { tripCostForParticipant } from '../data/costs';

export function Manage() {
  const trip = useStore(s => s.trip);
  const checklist = useStore(s => s.checklist);
  const activities = useStore(s => s.activities);
  const participants = useStore(s => s.participants);
  const currentId = useStore(s => s.currentParticipantId);
  const decisions = useStore(s => s.decisions);
  const changeLog = useStore(s => s.changeLog);

  const flights = activities.filter(a => a.category === 'טיסה').slice(0, 4);
  const hotels = activities.filter(a => a.category === 'מלון').slice(0, 4);
  const toBook = activities.filter(a => a.bookingRequired && a.status !== 'הוזמן');

  const [editing, setEditing] = useState<ChecklistItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [newDecision, setNewDecision] = useState(false);

  const me = participants.find(p => p.id === currentId);
  const meProfile = PROFILES[currentId];

  return (
    <div className="p-4 pb-2 space-y-4 animate-fade-up lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-5 lg:space-y-0 lg:items-start">
      <header className="lg:col-span-full flex items-start justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-extrabold text-ocean-700">ניהול הטיול</h1>
          <div className="text-[12px] text-zinc-500 mt-0.5">{trip.travelersCount} חברים · {trip.startDate.slice(5)} – {trip.endDate.slice(5)}</div>
        </div>
        <Chip tone="emerald">💶 ~€{tripCostForParticipant(activities, currentId, participants.map(p => p.id))} לאיש לטיול</Chip>
      </header>

      {/* Participant switcher */}
      <div className="rounded-2xl bg-white border border-ocean-100 p-3 lg:col-span-full">
        <div className="text-[12px] font-bold text-ocean-700 mb-2">👤 מי מעדכן עכשיו?</div>
        <div className="flex flex-wrap gap-1.5">
          {participants.map(p => (
            <button key={p.id} onClick={() => store.setCurrentParticipant(p.id)}
                    aria-label={p.name}
                    className={`min-h-[36px] rounded-full px-3 py-1.5 text-[12px] font-semibold transition
                      ${p.id === currentId
                        ? 'bg-ocean-700 text-white'
                        : 'bg-ocean-50 text-ocean-700'}`}>
              <span className="ml-1">{p.emoji}</span>{p.name}
            </button>
          ))}
        </div>
        {me && meProfile && (
          <div className="mt-2.5 text-[12px] text-zinc-600 leading-5 flex items-start gap-1.5">
            <span>{me.emoji}</span>
            <span><span className="font-bold text-ocean-700">{me.name}:</span> {meProfile.blurb}</span>
          </div>
        )}
      </div>

      {/* Decisions */}
      <Card title="🗳️ החלטות פתוחות" className="lg:col-span-2">
        <div className="space-y-2">
          {decisions.filter(d => d.status === 'פתוח').length === 0 && (
            <div className="text-[12px] text-zinc-500">אין החלטות פתוחות</div>
          )}
          {decisions.filter(d => d.status === 'פתוח').map(d => (
            <DecisionCard key={d.id} decision={d} myId={currentId} />
          ))}
          {decisions.filter(d => d.status === 'הוחלט').slice(0, 2).map(d => (
            <DecisionCard key={d.id} decision={d} myId={currentId} />
          ))}
          <button onClick={() => setNewDecision(true)}
                  className="w-full text-[12px] font-bold rounded-2xl border-2 border-dashed border-ocean-200 text-ocean-700 py-2.5 hover:bg-ocean-50">
            + החלטה חדשה
          </button>
        </div>
      </Card>

      <CollapsibleCard title="✈️ טיסות" count={flights.length}>
        {flights.map(f => (
          <Row key={f.id} title={f.name} sub={`${f.dayDate} · ${f.startTime}`} tone="emerald" right={f.status} />
        ))}
      </CollapsibleCard>

      <CollapsibleCard title="🏨 לינה" count={hotels.length}>
        {hotels.map(h => (
          <Row key={h.id} title={h.name} sub={`${h.dayDate} · ${h.region}`} tone="ocean" right={h.status} />
        ))}
      </CollapsibleCard>

      <CollapsibleCard title="📌 לסגור עכשיו" count={toBook.length} emptyText="הכל סגור — כיף!">
        {toBook.slice(0, 6).map(b => (
          <Row key={b.id} title={b.name} sub={`${b.dayDate} · ${b.region}`} tone="sunset" right="צריך הזמנה" />
        ))}
      </CollapsibleCard>

      {/* Checklist */}
      <div className="lg:col-span-full">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[14px] font-extrabold text-ocean-700">✅ צ׳ק-ליסט</h2>
          <button onClick={() => setAdding(true)}
                  className="text-[12px] font-bold rounded-full px-3 py-1.5 bg-ocean-700 text-white min-h-[36px]">+ פריט</button>
        </div>
        <div className="space-y-1.5">
          {checklist.map(c => (
            <div key={c.id} className="rounded-2xl bg-white border border-ocean-100 shadow-soft p-3 flex items-start gap-3">
              <button onClick={() => store.toggleChecklist(c.id)}
                      aria-label={c.status === 'הושלם' ? 'בטל סימון' : 'סמן כהושלם'}
                      className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0
                        ${c.status === 'הושלם' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-ocean-200 bg-white'}`}>
                {c.status === 'הושלם' ? '✓' : ''}
              </button>
              <div className="flex-1 min-w-0">
                <div className={`text-[14px] font-bold ${c.status === 'הושלם' ? 'line-through text-zinc-400' : 'text-ocean-700'}`}>
                  {c.title}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <Chip tone="ocean">{c.category}</Chip>
                  {c.owner && <Chip tone="sand">👤 {c.owner}</Chip>}
                  {c.dueDate && <Chip tone="zinc">⏰ {c.dueDate.slice(5)}</Chip>}
                  {c.priority === 'גבוה' && <Chip tone="red">חשוב</Chip>}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <button onClick={() => setEditing(c)} className="text-[11px] text-ocean-700 font-bold min-h-[28px] px-1">ערוך</button>
                <button onClick={() => { if (confirm('למחוק?')) store.deleteChecklist(c.id); }}
                        className="text-[11px] text-red-500 font-bold min-h-[28px] px-1">מחק</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Change history */}
      <Card title="🕘 היסטוריית שינויים" className="lg:col-span-full">
        {changeLog.length === 0 && <div className="text-[12px] text-zinc-500">עוד לא היו שינויים</div>}
        <div className="space-y-1">
          {changeLog.slice(0, 30).map(e => {
            const who = participants.find(p => p.id === e.who);
            return (
              <div key={e.id} className={`flex items-start gap-2 py-1.5 border-b border-ocean-100/60 last:border-0 ${e.undone ? 'opacity-40' : ''}`}>
                <span className="text-base flex-shrink-0">{who?.emoji || '👤'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] text-ocean-700 font-semibold truncate">
                    <span className="font-extrabold">{who?.name || 'מישהו'}</span> {e.summary}
                    {e.undone && <span className="text-[10px] text-red-500 mr-1.5">(בוטל)</span>}
                  </div>
                  <div className="text-[10px] text-zinc-500">{timeAgo(e.ts)}</div>
                </div>
                {!e.undone && ['create','delete','duplicate','update','status','move','movepart','assign','note','replace','plan','check_create','check_delete','check_update','check_toggle','vote','decide','decision_new','attend'].includes(e.action) && (
                  <button onClick={() => store.undo(e.id)}
                          className="text-[11px] text-sunset-700 font-extrabold min-h-[28px] px-2 rounded-full bg-sunset-300/20 hover:bg-sunset-300/40">
                    בטל
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <CollapsibleCard title="📞 שימושי וחירום" count={3}>
        <Row title="חירום באירופה" sub="חיוג: 112" tone="red" />
        <Row title="שגרירות ישראל במדריד" sub="+34 91 782 9500" tone="ocean" />
        <Row title="ביטוח נסיעות" sub="פרטים בקבוצת WhatsApp" tone="emerald" />
      </CollapsibleCard>

      <CollapsibleCard title="🔗 קישורים" count={3}>
        <a href="https://www.siampark.net" target="_blank" rel="noreferrer" className="block py-2 text-[13px] text-ocean-700 font-bold border-b border-ocean-100/60">Siam Park</a>
        <a href="https://www.volcanoteide.com" target="_blank" rel="noreferrer" className="block py-2 text-[13px] text-ocean-700 font-bold border-b border-ocean-100/60">Teide Cable Car</a>
        <a href="https://www.loroparque.com" target="_blank" rel="noreferrer" className="block py-2 text-[13px] text-ocean-700 font-bold">Loro Parque</a>
      </CollapsibleCard>

      <button onClick={() => { if (confirm('לאפס את כל הנתונים לערכי הברירה?')) store.reset(); }}
              className="w-full rounded-2xl bg-white border border-red-200 text-red-600 py-3 text-sm font-bold lg:col-span-full min-h-[44px]">
        אפס נתונים
      </button>

      {(editing || adding) && (
        <Sheet open onClose={() => { setEditing(null); setAdding(false); }} title={editing ? 'ערוך פריט' : 'פריט חדש'}>
          <ChecklistEditor
            initial={editing || newItem()}
            onSave={(v) => { store.upsertChecklist(v); setEditing(null); setAdding(false); }}
            onCancel={() => { setEditing(null); setAdding(false); }}
          />
        </Sheet>
      )}

      {newDecision && (
        <Sheet open onClose={() => setNewDecision(false)} title="החלטה חדשה">
          <DecisionEditor onSave={(t, o) => { store.addDecision(t, o); setNewDecision(false); }}
                          onCancel={() => setNewDecision(false)} />
        </Sheet>
      )}
    </div>
  );
}

function voteCountLabel(n: number) {
  if (n === 0) return 'אין קולות';
  if (n === 1) return 'קול 1';
  return `${n} קולות`;
}

function DecisionCard({ decision, myId }:{ decision: Decision; myId: string }) {
  const total = decision.options.reduce((s, o) => s + o.votes.length, 0);
  const leading = [...decision.options].sort((a,b) => b.votes.length - a.votes.length)[0];
  const closed = decision.status === 'הוחלט';
  const winnerId = decision.winnerId;
  const [confirmOpt, setConfirmOpt] = useState<string | null>(null);

  return (
    <div className={`rounded-2xl border p-3 ${closed ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-ocean-100 shadow-soft'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="text-[14px] font-extrabold text-ocean-700">{decision.title}</div>
        <Chip tone={closed ? 'emerald' : 'sunset'}>{closed ? '✓ הוחלט' : 'פתוח'}</Chip>
      </div>
      <div className="space-y-1.5">
        {decision.options.map(o => {
          const voted = o.votes.includes(myId);
          const isLeader = !closed && o.id === leading.id && o.votes.length > 0;
          const isWinner = closed && o.id === winnerId;
          const pct = total ? Math.round(100 * o.votes.length / total) : 0;
          const isConfirm = confirmOpt === o.id;
          return (
            <div key={o.id}>
              <button onClick={() => { if (closed) return; if (voted) { store.voteDecision(decision.id, o.id); } else { setConfirmOpt(o.id); } }}
                      disabled={closed}
                      className={`w-full text-right rounded-xl p-2 relative overflow-hidden min-h-[44px] border transition
                        ${isWinner ? 'bg-emerald-500 text-white border-emerald-500'
                          : voted ? 'bg-ocean-700 text-white border-ocean-700'
                          : 'bg-white border-ocean-100 text-ocean-700 hover:bg-ocean-50'}`}>
                <div className={`absolute inset-y-0 right-0 transition-all duration-500 ${voted || isWinner ? 'bg-white/20' : 'bg-ocean-50'}`}
                     style={{ width: `${pct}%` }} />
                <div className="relative flex items-center justify-between gap-2">
                  <span className="text-[13px] font-bold flex-1 truncate">
                    {voted && '✓ הצבעתי · '}{isLeader && !voted && '🏆 '}{o.label}
                  </span>
                  <span className={`text-[10px] font-extrabold tabular-nums rounded-full px-2 py-0.5 ${voted || isWinner ? 'bg-white/25' : 'bg-ocean-50 text-ocean-700'}`}>
                    {voteCountLabel(o.votes.length)}
                  </span>
                </div>
              </button>
              {isConfirm && !closed && (
                <div className="mt-1 mb-1 rounded-xl bg-sunset-300/15 border border-sunset-300 p-2 flex items-center justify-between gap-2">
                  <span className="text-[12px] text-sunset-700 font-semibold flex-1 truncate">הצבעת בעד "{o.label}"?</span>
                  <button onClick={() => { store.voteDecision(decision.id, o.id); setConfirmOpt(null); }}
                          className="text-[11px] font-extrabold rounded-full bg-ocean-700 text-white px-3 py-1.5 min-h-[32px]">אישור</button>
                  <button onClick={() => setConfirmOpt(null)}
                          className="text-[11px] font-extrabold rounded-full bg-white border border-ocean-100 text-ocean-700 px-3 py-1.5 min-h-[32px]">ביטול</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {!closed && total > 0 && (
        <button onClick={() => store.closeDecision(decision.id, leading.id)}
                className="mt-2 w-full text-[12px] font-extrabold rounded-full bg-emerald-500 text-white py-2 min-h-[36px]">
          סגור החלטה ({leading.label})
        </button>
      )}
    </div>
  );
}

function DecisionEditor({ onSave, onCancel }:{ onSave: (t: string, o: string[]) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [opts, setOpts] = useState(['','','']);
  const inp = 'w-full rounded-xl border border-ocean-100 bg-white px-3 py-2.5 text-[14px]';
  return (
    <div className="space-y-3">
      <input placeholder="על מה מחליטים?" className={inp} value={title} onChange={e => setTitle(e.target.value)} />
      {opts.map((o, i) => (
        <input key={i} placeholder={`אופציה ${i+1}`} className={inp} value={o}
               onChange={e => setOpts(opts.map((x,j) => j === i ? e.target.value : x))} />
      ))}
      <button onClick={() => setOpts([...opts, ''])} className="text-[12px] text-ocean-700 font-bold">+ עוד אופציה</button>
      <div className="grid grid-cols-2 gap-2.5 pt-2">
        <button onClick={() => title.trim() && onSave(title, opts.filter(o => o.trim()))}
                className="rounded-2xl bg-ocean-700 text-white py-3 font-bold min-h-[44px]">צור</button>
        <button onClick={onCancel} className="rounded-2xl bg-white border border-ocean-100 text-ocean-700 py-3 font-bold min-h-[44px]">ביטול</button>
      </div>
    </div>
  );
}

function timeAgo(ts: number) {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return 'הרגע';
  if (diff < 3600) return `לפני ${Math.floor(diff/60)} דק׳`;
  if (diff < 86400) return `לפני ${Math.floor(diff/3600)} שעות`;
  return `לפני ${Math.floor(diff/86400)} ימים`;
}

function newItem(): ChecklistItem {
  return { id: 'chk_' + Math.random().toString(36).slice(2,9), title: '', status: 'פתוח', priority: 'רגיל', category: 'אחר' };
}

function ChecklistEditor({ initial, onSave, onCancel }:{
  initial: ChecklistItem; onSave: (v: ChecklistItem) => void; onCancel: () => void;
}) {
  const [v, setV] = useState<ChecklistItem>({ ...initial });
  const inp = 'w-full rounded-xl border border-ocean-100 bg-white px-3 py-2.5 text-[14px]';
  return (
    <div className="space-y-3">
      <input placeholder="כותרת" className={inp} value={v.title} onChange={e => setV({ ...v, title: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <input placeholder="אחראי" className={inp} value={v.owner || ''} onChange={e => setV({ ...v, owner: e.target.value })} />
        <input type="date" className={inp} value={v.dueDate || ''} onChange={e => setV({ ...v, dueDate: e.target.value })} />
        <select className={inp} value={v.category} onChange={e => setV({ ...v, category: e.target.value as ChecklistItem['category'] })}>
          {['הזמנה','אריזה','החלטה','מסמכים','אחר'].map(c => <option key={c}>{c}</option>)}
        </select>
        <select className={inp} value={v.priority} onChange={e => setV({ ...v, priority: e.target.value as ChecklistItem['priority'] })}>
          {['נמוך','רגיל','גבוה'].map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2.5 pt-2">
        <button onClick={() => v.title.trim() && onSave(v)} className="rounded-2xl bg-ocean-700 text-white py-3 font-bold min-h-[44px]">שמור</button>
        <button onClick={onCancel} className="rounded-2xl bg-white border border-ocean-100 text-ocean-700 py-3 font-bold min-h-[44px]">ביטול</button>
      </div>
    </div>
  );
}

function Card({ title, children, emptyText, className='' }:{ title: string; children: React.ReactNode; emptyText?: string; className?: string }) {
  const arr = React.Children.toArray(children);
  return (
    <div className={`rounded-2xl bg-white border border-ocean-100 p-3 ${className}`}>
      <div className="text-[13px] font-bold text-ocean-700 mb-2">{title}</div>
      <div className="space-y-1.5">
        {arr.length > 0 ? arr : <div className="text-[12px] text-zinc-500">{emptyText || '—'}</div>}
      </div>
    </div>
  );
}
function CollapsibleCard({ title, children, emptyText, count, className='' }:{
  title: string; children: React.ReactNode; emptyText?: string; count?: number; className?: string;
}) {
  const arr = React.Children.toArray(children);
  return (
    <details className={`rounded-2xl bg-white border border-ocean-100 p-3 group ${className}`}>
      <summary className="flex items-center justify-between cursor-pointer list-none">
        <div className="text-[13px] font-bold text-ocean-700">{title}{count !== undefined && count > 0 && <span className="text-zinc-400 font-semibold mr-1.5">· {count}</span>}</div>
        <span className="text-zinc-400 text-xs group-open:rotate-180 transition">▾</span>
      </summary>
      <div className="space-y-1.5 mt-2">
        {arr.length > 0 ? arr : <div className="text-[12px] text-zinc-500">{emptyText || '—'}</div>}
      </div>
    </details>
  );
}
function Row({ title, sub, tone='ocean', right }:{ title: string; sub?: string; tone?: any; right?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="min-w-0">
        <div className="text-[13px] font-bold text-ocean-700 truncate">{title}</div>
        {sub && <div className="text-[11px] text-zinc-500 truncate">{sub}</div>}
      </div>
      {right && <Chip tone={tone}>{right}</Chip>}
    </div>
  );
}
