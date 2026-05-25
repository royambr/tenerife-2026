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
  loadVideoById(id: string): void;
  destroy(): void;
}

const TRACKS = [
  { id: 'J2WP-55FLNk', title: 'Shpongle Mix' },
  { id: 'ffm58-EPzmc', title: 'Shpongle — Are You Shpongled?' },
  { id: '6Kb5Oyk-AuE', title: 'Shpongle — Tales of the Inexpressible' },
  { id: 'j9IFgwFGFsg', title: 'Shpongle — Nothing Lasts' },
  { id: 'HyMBFOYDyAo', title: 'Shpongle — Museum of Consciousness' },
];

interface MusicCtx {
  playing: boolean;
  muted: boolean;
  ready: boolean;
  trackIndex: number;
  trackTitle: string;
  togglePlay(): void;
  toggleMute(): void;
  nextTrack(): void;
  prevTrack(): void;
  /** Call this directly from a user-gesture handler to start with sound */
  startWithSound(): void;
}

const MusicContext = createContext<MusicCtx>({
  playing: false, muted: true, ready: false, trackIndex: 0, trackTitle: TRACKS[0].title,
  togglePlay: () => {}, toggleMute: () => {}, nextTrack: () => {}, prevTrack: () => {}, startWithSound: () => {},
});

export function useMusicContext() { return useContext(MusicContext); }

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const playerReadyRef = useRef(false);
  const mutedRef = useRef(true);
  const pendingStartRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);

  useEffect(() => {
    function initPlayer() {
      if (!containerRef.current || !window.YT?.Player) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: TRACKS[0].id,
        playerVars: {
          autoplay: 1, loop: 1, playlist: TRACKS[0].id,
          controls: 0, disablekb: 1, fs: 0,
          modestbranding: 1, rel: 0, mute: 1,
        },
        events: {
          onReady: () => {
            playerReadyRef.current = true;
            setReady(true);
            playerRef.current?.playVideo();
            setPlaying(true);
            if (pendingStartRef.current) {
              pendingStartRef.current = false;
              playerRef.current?.unMute();
              playerRef.current?.setVolume(80);
              mutedRef.current = false;
              setMuted(false);
            }
          },
          onStateChange: (e: { data: number }) => {
            if (e.data === 0) {
              // Track ended — advance to next
              setTrackIndex(prev => {
                const next = (prev + 1) % TRACKS.length;
                playerRef.current?.loadVideoById(TRACKS[next].id);
                if (!mutedRef.current) {
                  playerRef.current?.unMute();
                  playerRef.current?.setVolume(80);
                }
                return next;
              });
            }
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

  // Call this synchronously inside a user-gesture handler — guarantees browser allows audio
  function startWithSound() {
    if (!playerReadyRef.current) {
      // Player not ready yet — queue the unmute for when it loads
      pendingStartRef.current = true;
      return;
    }
    playerRef.current?.unMute();
    playerRef.current?.setVolume(80);
    playerRef.current?.playVideo();
    mutedRef.current = false;
    setMuted(false);
    setPlaying(true);
  }

  function loadTrack(idx: number) {
    if (!playerRef.current) return;
    playerRef.current.loadVideoById(TRACKS[idx].id);
    if (!mutedRef.current) { playerRef.current.unMute(); playerRef.current.setVolume(80); }
    setTrackIndex(idx);
  }

  function nextTrack() { loadTrack((trackIndex + 1) % TRACKS.length); }
  function prevTrack() { loadTrack((trackIndex - 1 + TRACKS.length) % TRACKS.length); }

  function toggleMute() {
    if (!playerRef.current) return;
    if (muted) { playerRef.current.unMute(); playerRef.current.setVolume(80); mutedRef.current = false; setMuted(false); }
    else { playerRef.current.mute(); mutedRef.current = true; setMuted(true); }
  }

  function togglePlay() {
    if (!playerRef.current) return;
    playing ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
  }

  return (
    <MusicContext.Provider value={{ playing, muted, ready, trackIndex, trackTitle: TRACKS[trackIndex].title, togglePlay, toggleMute, nextTrack, prevTrack, startWithSound }}>
      <div ref={containerRef} style={{ width: 1, height: 1, position: 'fixed', opacity: 0, pointerEvents: 'none', bottom: 0, left: 0 }} />
      {children}
    </MusicContext.Provider>
  );
}

export function MusicControls({ className = '' }: { className?: string }) {
  const { playing, muted, ready, trackTitle, togglePlay, toggleMute, nextTrack, prevTrack } = useContext(MusicContext);
  return (
    <div className={`flex items-center gap-1 ${className}`} dir="ltr">
      <button onClick={prevTrack} disabled={!ready}
        className="text-[13px] leading-none text-ocean-700 disabled:opacity-30 px-0.5" aria-label="previous track">⏮</button>
      <button onClick={togglePlay} disabled={!ready}
        className="text-[14px] leading-none text-ocean-700 disabled:opacity-30 px-0.5" aria-label={playing ? 'pause' : 'play'}>
        {playing ? '⏸' : '▶'}
      </button>
      <button onClick={nextTrack} disabled={!ready}
        className="text-[13px] leading-none text-ocean-700 disabled:opacity-30 px-0.5" aria-label="next track">⏭</button>
      <span className="text-[10px] text-ocean-700/50 font-medium max-w-[80px] truncate hidden lg:inline">{trackTitle}</span>
      <button onClick={toggleMute} disabled={!ready}
        className={`text-[13px] leading-none disabled:opacity-30 px-0.5 ${muted ? 'opacity-40' : 'text-ocean-700'}`}
        title={muted ? 'הפעל צליל' : 'השתק'}>
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
