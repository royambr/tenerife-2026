import React, { useMemo } from 'react';
import { useStore, store } from '../store';
import type { Expense, Settlement } from '../data/types';

interface Transfer { fromId: string; toId: string; amount: number; }

function computeBalances(expenses: Expense[], settlements: Settlement[], participantIds: string[]) {
  const bal: Record<string, number> = {};
  for (const id of participantIds) bal[id] = 0;
  for (const e of expenses) {
    if (!e.splitWith.length) continue;
    const share = e.amountEUR / e.splitWith.length;
    bal[e.payerId] = (bal[e.payerId] || 0) + e.amountEUR;
    for (const p of e.splitWith) bal[p] = (bal[p] || 0) - share;
  }
  // settlements: from paid → to → reduces from's debt, reduces to's credit
  for (const s of settlements) {
    bal[s.fromId] = (bal[s.fromId] || 0) + s.amountEUR;
    bal[s.toId] = (bal[s.toId] || 0) - s.amountEUR;
  }
  return bal;
}

function simplify(bal: Record<string, number>): Transfer[] {
  const entries = Object.entries(bal).map(([id, v]) => ({ id, v: Math.round(v * 100) / 100 }));
  const creditors = entries.filter(e => e.v > 0.01).sort((a,b) => b.v - a.v);
  const debtors = entries.filter(e => e.v < -0.01).sort((a,b) => a.v - b.v); // most negative first
  const transfers: Transfer[] = [];
  let ci = 0, di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const c = creditors[ci];
    const d = debtors[di];
    const amt = Math.min(c.v, -d.v);
    transfers.push({ fromId: d.id, toId: c.id, amount: Math.round(amt * 100) / 100 });
    c.v -= amt; d.v += amt;
    if (c.v < 0.01) ci++;
    if (d.v > -0.01) di++;
  }
  return transfers;
}

export function SettlementCard() {
  const expenses = useStore(s => s.expenses);
  const settlements = useStore(s => s.settlements);
  const participants = useStore(s => s.participants);
  const ids = participants.map(p => p.id);

  const balances = useMemo(() => computeBalances(expenses, settlements, ids), [expenses, settlements, ids]);
  const transfers = useMemo(() => simplify(balances), [balances]);
  const total = expenses.reduce((s, e) => s + e.amountEUR, 0);

  return (
    <div className="rounded-2xl bg-white border border-ocean-100 p-3 lg:col-span-2">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[13px] font-bold text-ocean-700">💸 מי חייב למי?</div>
        <div className="text-[11px] font-bold text-zinc-500 tabular-nums">סה״כ €{total.toFixed(0)}</div>
      </div>
      {expenses.length === 0 ? (
        <div className="text-[12px] text-zinc-500">עוד לא נרשמו הוצאות. הוסיפו הוצאה בפעילות כלשהי.</div>
      ) : transfers.length === 0 ? (
        <div className="text-[12px] text-emerald-700 font-bold">🎉 כולם מסולקים!</div>
      ) : (
        <div className="space-y-1.5">
          {transfers.map((t, i) => {
            const from = participants.find(p => p.id === t.fromId);
            const to = participants.find(p => p.id === t.toId);
            return (
              <div key={i} className="flex items-center justify-between gap-2 rounded-xl bg-ocean-50/60 px-3 py-2">
                <div className="text-[13px] font-bold text-ocean-700 truncate">
                  {from?.emoji} {from?.name} <span className="text-sunset-700">▸ €{t.amount.toFixed(2)} ▸</span> {to?.emoji} {to?.name}
                </div>
                <button onClick={() => store.addSettlement(t.fromId, t.toId, t.amount)}
                        className="text-[11px] font-extrabold rounded-full bg-emerald-500 text-white px-3 py-1.5 min-h-[32px] flex-shrink-0">
                  ✓ סולק
                </button>
              </div>
            );
          })}
        </div>
      )}
      {settlements.length > 0 && (
        <details className="mt-2">
          <summary className="text-[11px] font-bold text-zinc-500 cursor-pointer">היסטוריית סילוקים ({settlements.length})</summary>
          <ul className="mt-1.5 space-y-1">
            {settlements.slice().reverse().map(s => {
              const from = participants.find(p => p.id === s.fromId);
              const to = participants.find(p => p.id === s.toId);
              return (
                <li key={s.id} className="flex items-center justify-between text-[11px] text-zinc-600">
                  <span>{from?.name} ▸ €{s.amountEUR.toFixed(2)} ▸ {to?.name}</span>
                  <button onClick={() => store.removeSettlement(s.id)}
                          className="text-red-500 font-bold">בטל</button>
                </li>
              );
            })}
          </ul>
        </details>
      )}
    </div>
  );
}
