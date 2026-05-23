import React, { useState } from 'react';
import type { Activity } from '../data/types';
import { store, useStore } from '../store';

export function ActivityExpenses({ activity }: { activity: Activity }) {
  const allExpenses = useStore(s => s.expenses);
  const participants = useStore(s => s.participants);
  const me = useStore(s => s.currentParticipantId);
  const expenses = allExpenses.filter(e => e.activityId === activity.id);
  const sum = expenses.reduce((s, e) => s + e.amountEUR, 0);
  const [open, setOpen] = useState(expenses.length > 0);
  const [adding, setAdding] = useState(false);

  // form state
  const [amount, setAmount] = useState('');
  const [payerId, setPayerId] = useState(me);
  const [splitWith, setSplitWith] = useState<string[]>(participants.map(p => p.id));
  const [note, setNote] = useState('');

  React.useEffect(() => { setPayerId(me); }, [me]);

  const submit = () => {
    const n = parseFloat(amount);
    if (!n || n <= 0 || splitWith.length === 0) return;
    store.addExpense({
      activityId: activity.id,
      dayDate: activity.dayDate,
      payerId,
      amountEUR: Math.round(n * 100) / 100,
      splitWith,
      note: note.trim() || undefined,
    });
    setAmount(''); setNote(''); setAdding(false);
  };

  return (
    <div className="rounded-2xl bg-white border border-ocean-100">
      <button onClick={() => setOpen(v => !v)}
              className="w-full px-3 py-2.5 flex items-center justify-between min-h-[44px]">
        <span className="text-[13px] font-extrabold text-ocean-700">💶 כסף ({sum.toFixed(0)}€)</span>
        <span className="text-zinc-400 text-xs">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2">
          {expenses.length === 0 && (
            <div className="text-[12px] text-zinc-500 text-center py-2">עוד לא נרשמו הוצאות</div>
          )}
          <ul className="space-y-1">
            {expenses.map(e => {
              const payer = participants.find(p => p.id === e.payerId);
              return (
                <li key={e.id} className="flex items-center justify-between gap-2 text-[12px] bg-ocean-50/50 rounded-xl px-2.5 py-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-ocean-700 truncate">
                      {payer?.emoji} {payer?.name} שילם €{e.amountEUR.toFixed(2)}
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate">
                      {e.note ? `${e.note} · ` : ''}על {e.splitWith.length} אנשים
                    </div>
                  </div>
                  <button onClick={() => { if (confirm('למחוק הוצאה?')) store.deleteExpense(e.id); }}
                          className="text-[11px] text-red-500 font-bold">מחק</button>
                </li>
              );
            })}
          </ul>
          {!adding ? (
            <button onClick={() => setAdding(true)}
                    className="w-full rounded-xl border-2 border-dashed border-ocean-200 text-ocean-700 py-2 text-[12px] font-bold min-h-[40px]">
              + הוסף הוצאה
            </button>
          ) : (
            <div className="space-y-2 border-t border-ocean-100 pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="סכום"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="flex-1 rounded-xl border border-ocean-100 px-3 py-2 text-[14px] min-h-[40px]"
                />
                <span className="text-[14px] font-bold text-ocean-700">€</span>
              </div>
              <div>
                <div className="text-[11px] font-bold text-zinc-500 mb-1">שילם:</div>
                <div className="flex flex-wrap gap-1">
                  {participants.map(p => (
                    <button key={p.id} onClick={() => setPayerId(p.id)}
                            className={`text-[11px] rounded-full px-2.5 py-1 min-h-[32px] border
                              ${payerId === p.id ? 'bg-ocean-700 text-white border-ocean-700' : 'bg-white border-ocean-100 text-ocean-700'}`}>
                      {p.emoji} {p.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-zinc-500 mb-1">להתחלק עם:</div>
                <div className="flex flex-wrap gap-1">
                  {participants.map(p => {
                    const sel = splitWith.includes(p.id);
                    return (
                      <button key={p.id} onClick={() => setSplitWith(sel ? splitWith.filter(x => x !== p.id) : [...splitWith, p.id])}
                              className={`text-[11px] rounded-full px-2.5 py-1 min-h-[32px] border
                                ${sel ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white border-ocean-100 text-zinc-400 line-through'}`}>
                        {p.emoji} {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <input
                placeholder="הערה (אופציונלי)"
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full rounded-xl border border-ocean-100 px-3 py-2 text-[13px] min-h-[40px]"
              />
              <div className="grid grid-cols-2 gap-2">
                <button onClick={submit}
                        className="rounded-xl bg-ocean-700 text-white py-2.5 text-[13px] font-bold min-h-[44px]">שמור</button>
                <button onClick={() => setAdding(false)}
                        className="rounded-xl bg-white border border-ocean-100 text-ocean-700 py-2.5 text-[13px] font-bold min-h-[44px]">ביטול</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
