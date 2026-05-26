import React, { useState } from 'react';
import { BottomNav, Tab } from './components/BottomNav';
import { SideNav } from './components/SideNav';
import { Today } from './screens/Today';
import { Schedule } from './screens/Schedule';
import { Plans } from './screens/Plans';
import { MapScreen } from './screens/MapScreen';
import { Manage } from './screens/Manage';
import { Events } from './screens/Events';
import { Restaurants } from './screens/Restaurants';
import { Phrasebook } from './components/Phrasebook';
import { FeedbackLog } from './screens/FeedbackLog';
import { useStore, useEditMode, editStore } from './store';
import { ToastHost } from './components/ToastHost';
import { FeedbackFab } from './components/FeedbackSheet';
import { WelcomeScreen } from './components/WelcomeScreen';
import { MusicProvider, MusicPlayer, MusicControls } from './components/MusicPlayer';
import { useFeedbackSync } from './lib/feedbackSync';

function AppInner() {
  const [tab, setTab] = useState<Tab>('today');
  const trip = useStore(s => s.trip);
  const edit = useEditMode();
  useFeedbackSync();

  return (
    <div dir="rtl" className={`min-h-screen text-ocean-700 ${edit ? 'pt-10' : ''}`}>
      <WelcomeScreen onEnter={() => {}} />

      {/* Mobile sticky title + music bar */}
      <div className="lg:hidden sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-ocean-100 px-4 py-2 flex items-center justify-between">
        <div className="text-[12px] font-extrabold text-ocean-700 leading-tight">
          טנריף · {trip.title} · יוני 2026
        </div>
        <MusicControls />
      </div>

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
              <h1 className="text-2xl font-extrabold text-ocean-700">טנריף · {trip.title} · יוני 2026</h1>
              <div className="text-sm text-zinc-500">{trip.travelersCount} חברים · {trip.startDate} – {trip.endDate}</div>
            </div>
            <MusicControls className="bg-ocean-50 rounded-2xl px-3 py-2" />
          </header>

          <div className="mx-auto max-w-md lg:max-w-none">
            <div className="safe-bottom lg:pb-6">
              {tab === 'today'    && <Today />}
              {tab === 'schedule' && <Schedule />}
              {tab === 'plans'    && <Plans />}
              {tab === 'map'      && <MapScreen />}
              {tab === 'events'      && <Events />}
              {tab === 'restaurants' && <Restaurants />}
              {tab === 'manage'      && <Manage />}
              {tab === 'phrasebook'  && <div className="p-4 pb-2 animate-fade-up"><Phrasebook /></div>}
              {tab === 'feedback'    && <FeedbackLog />}
            </div>
          </div>
        </main>
      </div>

      <div className="lg:hidden">
        <BottomNav tab={tab} onChange={setTab} />
      </div>

      <MusicPlayer />
      <FeedbackFab activeTab={tab} />
      <ToastHost />
    </div>
  );
}

export default function App() {
  return (
    <MusicProvider>
      <AppInner />
    </MusicProvider>
  );
}
