import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    YT: {
      Player: new (el: HTMLElement, opts: object) => YTPlayer;
      PlayerState: { ENDED: number; PLAYING: number; PAUSED: number };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  setVolume(v: number): void;
  destroy(): void;
}

const VIDEO_ID = 'J2WP-55FLNk';

interface MusicCtx {
  playing: boolean;
  muted: boolean;
  ready: boolean;
  togglePlay(): void;
  toggleMute(): void;
}

const MusicContext = createContext<MusicCtx>({
  playing: false, muted: false, ready: false,
  togglePlay: () => {}, toggleMute: () => {},
});

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const interactedRef = useRef(false);
  const playerReadyRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);

  function unmuteAndPlay() {
    if (!playerRef.current) return;
    playerRef.current.unMute();
    playerRef.current.setVolume(80);
    playerRef.current.playVideo();
    setMuted(false);
    setPlaying(true);
  }

  // On first user gesture, unmute if player is already ready; otherwise flag for onReady
  useEffect(() => {
    function onFirstInteraction() {
      if (interactedRef.current) return;
      interactedRef.current = true;
      if (playerReadyRef.current) unmuteAndPlay();
      document.removeEventListener('click', onFirstInteraction);
      document.removeEventListener('keydown', onFirstInteraction);
      document.removeEventListener('touchstart', onFirstInteraction);
    }
    document.addEventListener('click', onFirstInteraction);
    document.addEventListener('keydown', onFirstInteraction);
    document.addEventListener('touchstart', onFirstInteraction);
    return () => {
      document.removeEventListener('click', onFirstInteraction);
      document.removeEventListener('keydown', onFirstInteraction);
      document.removeEventListener('touchstart', onFirstInteraction);
    };
  }, []);

  useEffect(() => {
    function initPlayer() {
      if (!containerRef.current || !window.YT?.Player) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: 1, loop: 1, playlist: VIDEO_ID,
          controls: 0, disablekb: 1, fs: 0,
          modestbranding: 1, rel: 0, mute: 1,
        },
        events: {
          onReady: (e: { target: YTPlayer }) => {
            e.target.playVideo();
            playerReadyRef.current = true;
            setReady(true);
            setPlaying(true);
            // User already clicked (e.g. WelcomeScreen enter button) → unmute now
            if (interactedRef.current) unmuteAndPlay();
          },
          onStateChange: (e: { data: number }) => {
            if (e.data === 0) playerRef.current?.playVideo();
            setPlaying(e.data === 1);
          },
        },
      });
    }

    if (window.YT?.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
      if (!document.getElementById('yt-iframe-api')) {
        const s = document.createElement('script');
        s.id = 'yt-iframe-api';
        s.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(s);
      }
    }

    return () => { playerRef.current?.destroy(); };
  }, []);

  function toggleMute() {
    if (!playerRef.current) return;
    if (muted) { playerRef.current.unMute(); playerRef.current.setVolume(80); setMuted(false); }
    else { playerRef.current.mute(); setMuted(true); }
  }

  function togglePlay() {
    if (!playerRef.current) return;
    playing ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
  }

  return (
    <MusicContext.Provider value={{ playing, muted, ready, togglePlay, toggleMute }}>
      <div ref={containerRef} style={{ width: 1, height: 1, position: 'fixed', opacity: 0, pointerEvents: 'none', bottom: 0, left: 0 }} />
      {children}
    </MusicContext.Provider>
  );
}

export function MusicControls({ className = '' }: { className?: string }) {
  const { playing, muted, ready, togglePlay, toggleMute } = useContext(MusicContext);
  return (
    <div className={`flex items-center gap-1.5 ${className}`} dir="ltr">
      <button
        onClick={togglePlay}
        disabled={!ready}
        className="text-[14px] leading-none text-ocean-700 disabled:opacity-30"
        aria-label={playing ? 'pause' : 'play'}
      >
        {playing ? '⏸' : '▶'}
      </button>
      <span className="text-[11px] font-bold text-ocean-700 opacity-60">♫</span>
      <button
        onClick={toggleMute}
        disabled={!ready}
        className={`text-[13px] leading-none disabled:opacity-30 ${muted ? 'opacity-40' : 'text-ocean-700'}`}
        aria-label={muted ? 'unmute' : 'mute'}
        title={muted ? 'הפעל צליל' : 'השתק'}
      >
        {muted ? '🔇' : '🔊'}
      </button>
    </div>
  );
}

// Floating button — mobile only
export function MusicPlayer() {
  return (
    <div className="fixed bottom-20 left-3 z-50 lg:hidden" dir="ltr">
      <div className="flex items-center gap-1.5 bg-white border border-ocean-100 shadow-card rounded-full px-3 py-2">
        <MusicControls />
      </div>
    </div>
  );
}
