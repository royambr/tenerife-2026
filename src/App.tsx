import React, { useState } from 'react';
import { BottomNav, Tab } from './components/BottomNav';
import { SideNav } from './components/SideNav';
import { Today } from './screens/Today';
import { Schedule } from './screens/Schedule';
import { Plans } from './screens/Plans';
import { MapScreen } from './screens/MapScreen';
import { Manage } from './screens/Manage';
import { useStore, useEditMode, editStore } from './store';
import { ToastHost } from './components/ToastHost';

export default function App() {
  const [tab, setTab] = useState<Tab>('today');
  const trip = useStore(s => s.trip);
  const edit = useEditMode();

  return (
    <div dir="rtl" className={`min-h-screen text-ocean-700 ${edit ? 'pt-10' : ''}`}>
      {edit && (
        <div className="fixed top-0 inset-x-0 z-[80] bg-volcano-900 text-white text-center text-[12px] font-extrabold py-2 px-3 shadow-card flex items-center justify-center gap-3">
          <span>✏️ מצב עריכה פעיל — כל פעולה נשמרת בהיסטוריה</span>
          <button onClick={() => editStore.set(false)}
                  className="bg-white/20 rounded-full px-3 py-0.5 text-[11px] hover:bg-white/30">סיים עריכה</button>
        </div>
      )}

      <div className="lg:flex lg:max-w-7xl lg:mx-auto lg:gap-6 lg:p-6">
        <aside className="hidden lg:block lg:w-72 lg:flex-shrink-0 lg:sticky lg:top-6 lg:self-start">
          <SideNav tab={tab} onChange={setTab} />
        </aside>

        <main className="flex-1 min-w-0">
          <header className="hidden lg:flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-extrabold text-ocean-700">{trip.title}</h1>
              <div className="text-sm text-zinc-500">{trip.startDate} – {trip.endDate} · {trip.travelersCount} חברים</div>
            </div>
          </header>

          <div className="mx-auto max-w-md lg:max-w-none">
            <div className="safe-bottom lg:pb-6">
              {tab === 'today'    && <Today />}
              {tab === 'schedule' && <Schedule />}
              {tab === 'plans'    && <Plans />}
              {tab === 'map'      && <MapScreen />}
              {tab === 'manage'   && <Manage />}
            </div>
          </div>
        </main>
      </div>

      <div className="lg:hidden">
        <BottomNav tab={tab} onChange={setTab} />
      </div>

      <ToastHost />
    </div>
  );
}
