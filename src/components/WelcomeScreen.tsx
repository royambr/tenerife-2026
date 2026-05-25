import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { useMusicContext } from './MusicPlayer';

const SESSION_KEY = 'tnf_welcomed';

interface Props {
  onEnter: () => void;
}

export function WelcomeScreen({ onEnter }: Props) {
  const trip = useStore(s => s.trip);
  const [visible, setVisible] = useState(false);
  const { startWithSound } = useMusicContext();

  useEffect(() => {
    if (!sessionStorage.getItem(SESSION_KEY)) setVisible(true);
  }, []);

  if (!visible) return null;

  function handleEnter() {
    sessionStorage.setItem(SESSION_KEY, '1');
    setVisible(false);
    startWithSound(); // guaranteed user-gesture context → browser allows audio
    onEnter();
  }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gradient-to-b from-ocean-700 to-ocean-500 text-white px-6 text-center">
      <div className="text-7xl mb-6">🌋</div>
      <h1 className="text-[34px] font-extrabold leading-tight mb-2">{trip.title}</h1>
      <p className="text-[16px] opacity-80 mb-1">{trip.startDate} – {trip.endDate}</p>
      <p className="text-[14px] opacity-60 mb-12">{trip.travelersCount} חברים · טנריף</p>
      <button
        onClick={handleEnter}
        className="bg-white text-ocean-700 font-extrabold text-[18px] rounded-full px-12 py-4 shadow-card active:scale-95 transition-transform"
      >
        כנסו 🌊
      </button>
    </div>
  );
}
