import React, { useState } from 'react';
import { BottomNav, Tab } from './components/BottomNav';
import { SideNav } from './components/SideNav';
import { Today } from './screens/Today';
import { Schedule } from './screens/Schedule';
import { Plans } from './screens/Plans';
import { MapScreen } from './screens/MapScreen';
import { Manage } from './screens/Manage';
import { useStore } from './store';

export default function App() {
  const [tab, setTab] = useState<Tab>('today');
  const trip = useStore(s => s.trip);

  return (
    <div dir="rtl" className="min-h-screen text-ocean-700">
      {/* Desktop layout: sidebar + wide content */}
      <div className="lg:flex lg:max-w-7xl lg:mx-auto lg:gap-6 lg:p-6">
        <aside className="hidden lg:block lg:w-72 lg:flex-shrink-0 lg:sticky lg:top-6 lg:self-start">
          <SideNav tab={tab} onChange={setTab} />
        </aside>

        <main className="flex-1 min-w-0">
          {/* Desktop header */}
          <header className="hidden lg:flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-extrabold text-ocean-700">{trip.title}</h1>
              <div className="text-sm text-zinc-500">{trip.startDate} – {trip.endDate} · {trip.travelersCount} חברים</div>
            </div>
          </header>

          {/* Mobile column stays narrow; desktop uses full width */}
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

      {/* Mobile-only bottom nav */}
      <div className="lg:hidden">
        <BottomNav tab={tab} onChange={setTab} />
      </div>
    </div>
  );
}
