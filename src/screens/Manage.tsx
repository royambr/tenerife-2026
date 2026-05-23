import React, { useState } from 'react';
import { useStore, store } from '../store';
import { Chip } from '../components/Chip';
import { Sheet } from '../components/Sheet';
import type { ChecklistItem } from '../data/types';

export function Manage() {
  const trip = useStore(s => s.trip);
  const checklist = useStore(s => s.checklist);
  const activities = useStore(s => s.activities);

  const flights = activities.filter(a => a.category === 'טיסה').slice(0, 4);
  const hotels = activities.filter(a => a.category === 'מלון').slice(0, 4);
  const decisions = activities.filter(a => a.status === 'דורש החלטה');
  const toBook = activities.filter(a => a.bookingRequired && a.status !== 'הוזמן');

  const [editing, setEditing] = useState<ChecklistItem | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="p-4 pb-2 space-y-5 animate-fade-up lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-5 lg:space-y-0 lg:items-start">
      <header className="lg:col-span-full">
        <h1 className="text-[22px] font-extrabold text-ocean-700">ניהול הטיול</h1>
        <div className="text-[12px] text-zinc-500 mt-0.5">{trip.travelersCount} חברים · {trip.startDate} – {trip.endDate}</div>
      </header>

      <Card title="✈️ טיסות">
        {flights.map(f => (
          <Row key={f.id} title={f.name} sub={`${f.dayDate} · ${f.startTime}`} tone="emerald" right={f.status} />
        ))}
      </Card>

      <Card title="🏨 לינה">
        {hotels.map(h => (
          <Row key={h.id} title={h.name} sub={`${h.dayDate} · ${h.region}`} tone="ocean" right={h.status} />
        ))}
        <div className="mt-2 text-[12px] text-zinc-500">2 לילות ראשונים: Hotel Las Aguilas, Puerto de la Cruz</div>
      </Card>

      <Card title="📌 לסגור עכשיו" emptyText="הכל סגור — כיף!">
        {toBook.slice(0, 6).map(b => (
          <Row key={b.id} title={b.name} sub={`${b.dayDate} · ${b.region}`} tone="sunset" right="צריך הזמנה" />
        ))}
      </Card>

      <Card title="🟠 פתוח להחלטה" emptyText="אין החלטות פתוחות">
        {decisions.slice(0, 6).map(d => (
          <Row key={d.id} title={d.name} sub={`${d.dayDate} · ${d.category}`} tone="sand" right="לדון" />
        ))}
      </Card>

      <div className="lg:col-span-full">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[15px] font-extrabold text-ocean-700">✅ צ׳ק-ליסט</h2>
          <button onClick={() => setAdding(true)}
                  className="text-[12px] font-bold rounded-full px-3 py-1.5 bg-ocean-700 text-white">+ פריט</button>
        </div>
        <div className="space-y-1.5">
          {checklist.map(c => (
            <div key={c.id} className="rounded-2xl bg-white border border-ocean-100 shadow-soft p-3 flex items-start gap-3">
              <button onClick={() => store.toggleChecklist(c.id)}
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
                <button onClick={() => setEditing(c)} className="text-[11px] text-ocean-700 font-bold">ערוך</button>
                <button onClick={() => { if (confirm('למחוק?')) store.deleteChecklist(c.id); }}
                        className="text-[11px] text-red-500 font-bold">מחק</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card title="📞 שימושי וחירום">
        <Row title="חירום באירופה" sub="חיוג: 112" tone="red" />
        <Row title="שגרירות ישראל במדריד" sub="+34 91 782 9500" tone="ocean" />
        <Row title="ביטוח נסיעות" sub="פרטים בקבוצת WhatsApp" tone="emerald" />
      </Card>

      <Card title="🔗 קישורים שימושיים">
        <a href="https://www.siampark.net" target="_blank" rel="noreferrer" className="block py-2 text-[13px] text-ocean-700 font-bold border-b border-ocean-100/60">Siam Park · אתר רשמי</a>
        <a href="https://www.volcanoteide.com" target="_blank" rel="noreferrer" className="block py-2 text-[13px] text-ocean-700 font-bold border-b border-ocean-100/60">Teide Cable Car</a>
        <a href="https://www.loroparque.com" target="_blank" rel="noreferrer" className="block py-2 text-[13px] text-ocean-700 font-bold">Loro Parque</a>
      </Card>

      <button onClick={() => { if (confirm('לאפס את כל הנתונים לערכי הברירה?')) store.reset(); }}
              className="w-full rounded-2xl bg-white border border-red-200 text-red-600 py-3 text-sm font-bold lg:col-span-full">
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
    </div>
  );
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
        <button onClick={() => v.title.trim() && onSave(v)} className="rounded-2xl bg-ocean-700 text-white py-3 font-bold">שמור</button>
        <button onClick={onCancel} className="rounded-2xl bg-white border border-ocean-100 text-ocean-700 py-3 font-bold">ביטול</button>
      </div>
    </div>
  );
}

function Card({ title, children, emptyText }:{ title: string; children: React.ReactNode; emptyText?: string }) {
  const arr = React.Children.toArray(children);
  return (
    <div className="rounded-2xl bg-white border border-ocean-100 shadow-soft p-3.5">
      <div className="text-[13px] font-extrabold text-ocean-700 mb-2">{title}</div>
      <div className="space-y-1.5">
        {arr.length > 0 ? arr : <div className="text-[12px] text-zinc-500">{emptyText || '—'}</div>}
      </div>
    </div>
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
