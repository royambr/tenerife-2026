import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    SC: {
      Widget: ((el: HTMLIFrameElement) => SCWidget) & {
        Events: { PLAY: string; PAUSE: string; FINISH: string; READY: string; PLAY_PROGRESS: string };
      };
    };
  }
}

interface SCWidget {
  play(): void;
  pause(): void;
  setVolume(v: number): void;
  bind(event: string, cb: (data?: unknown) => void): void;
  getCurrentSound(cb: (sound: { title?: string }) => void): void;
}

const SC_URL = 'https://soundcloud.com/shponglemusic/sets/shpongle-static-live-at-ozora';
const VOLUME_KEY = 'tnf_music_volume';

interface Props {
  playRef: React.MutableRefObject<(() => void) | null>;
}

export function MusicPlayer({ playRef }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<SCWidget | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState('Shpongle — Static Live at Ozora');
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem(VOLUME_KEY);
    return saved ? parseInt(saved, 10) : 70;
  });

  useEffect(() => {
    if (document.getElementById('sc-widget-api')) return;
    const script = document.createElement('script');
    script.id = 'sc-widget-api';
    script.src = 'https://w.soundcloud.com/player/api.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  function handleIframeLoad() {
    const tryInit = () => {
      if (!window.SC || !iframeRef.current) { setTimeout(tryInit, 200); return; }
      const widget = window.SC.Widget(iframeRef.current);
      widgetRef.current = widget;
      widget.bind(window.SC.Widget.Events.READY, () => {
        widget.setVolume(volume);
        setReady(true);
      });
      widget.bind(window.SC.Widget.Events.PLAY, () => {
        setPlaying(true);
        widget.getCurrentSound(s => { if (s?.title) setTitle(s.title); });
      });
      widget.bind(window.SC.Widget.Events.PAUSE, () => setPlaying(false));
      widget.bind(window.SC.Widget.Events.FINISH, () => setPlaying(false));
    };
    tryInit();
  }

  useEffect(() => {
    playRef.current = () => {
      if (widgetRef.current && ready) widgetRef.current.play();
    };
  }, [ready, playRef]);

  function togglePlay() {
    if (!widgetRef.current || !ready) return;
    playing ? widgetRef.current.pause() : widgetRef.current.play();
  }

  function handleVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseInt(e.target.value, 10);
    setVolume(v);
    localStorage.setItem(VOLUME_KEY, String(v));
    widgetRef.current?.setVolume(v);
  }

  const iframeSrc =
    `https://w.soundcloud.com/player/?url=${encodeURIComponent(SC_URL)}` +
    `&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false`;

  return (
    <div className="fixed bottom-20 left-3 z-50 lg:bottom-6 lg:left-6" dir="ltr">
      <iframe
        ref={iframeRef}
        src={iframeSrc}
        onLoad={handleIframeLoad}
        allow="autoplay"
        style={{ width: 1, height: 1, position: 'absolute', opacity: 0, pointerEvents: 'none' }}
        title="music"
      />

      {!expanded && (
        <div className="flex items-center gap-2 bg-ocean-700 text-white rounded-full px-3 py-2 shadow-card">
          <button
            onClick={togglePlay}
            disabled={!ready}
            className="text-[16px] leading-none min-w-[24px] disabled:opacity-40"
            aria-label={playing ? 'pause' : 'play'}
          >
            {playing ? '⏸' : '▶'}
          </button>
          <button
            onClick={() => setExpanded(true)}
            className="text-[11px] font-bold opacity-80 hover:opacity-100 truncate max-w-[120px]"
          >
            ♫ {playing ? title.slice(0, 22) : 'Shpongle'}
          </button>
        </div>
      )}

      {expanded && (
        <div className="bg-ocean-700 text-white rounded-2xl shadow-card p-4 w-64">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-extrabold">♫ Shpongle</span>
            <button onClick={() => setExpanded(false)} className="text-[11px] opacity-60 hover:opacity-100">✕</button>
          </div>
          <div className="text-[11px] opacity-70 mb-3 truncate">{title}</div>
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={togglePlay}
              disabled={!ready}
              className="text-[32px] leading-none disabled:opacity-40"
              aria-label={playing ? 'pause' : 'play'}
            >
              {playing ? '⏸' : '▶'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px]">🔈</span>
            <input
              type="range" min="0" max="100" value={volume}
              onChange={handleVolume}
              className="flex-1 accent-white h-1.5"
            />
            <span className="text-[11px] opacity-60 w-6 text-right">{volume}</span>
          </div>
          {!ready && <div className="text-[10px] opacity-50 text-center mt-2">טוען נגן...</div>}
        </div>
      )}
    </div>
  );
}
