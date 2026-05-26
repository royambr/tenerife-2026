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
  getCurrentTime(): number;
  getDuration(): number;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  destroy(): void;
}

const TRACKS = [
  { id: 'J2WP-55FLNk',  title: 'Shpongle Mix' },
  { id: 'ffm58-EPzmc',  title: 'Are You Shpongled?' },
  { id: '6Kb5Oyk-AuE',  title: 'Tales of the Inexpressible' },
  { id: 'j9IFgwFGFsg',  title: 'Nothing Lasts' },
  { id: 'HyMBFOYDyAo',  title: 'Museum of Consciousness' },
];

function fmt(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
}

interface MusicCtx {
  playing: boolean; muted: boolean; ready: boolean;
  trackIndex: number; trackTitle: string;
  currentTime: number; duration: number;
  togglePlay(): void; toggleMute(): void;
  nextTrack(): void; prevTrack(): void;
  seek(s: number): void; startWithSound(): void;
}

const MusicContext = createContext<MusicCtx>({
  playing: false, muted: true, ready: false, trackIndex: 0,
  trackTitle: TRACKS[0].title, currentTime: 0, duration: 0,
  togglePlay: () => {}, toggleMute: () => {}, nextTrack: () => {},
  prevTrack: () => {}, seek: () => {}, startWithSound: () => {},
});

export function useMusicContext() { return useContext(MusicContext); }

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef    = useRef<YTPlayer | null>(null);
  const playerReadyRef  = useRef(false);
  const mutedRef        = useRef(true);
  const pendingStartRef = useRef(false);
  const trackIndexRef   = useRef(0);

  const [playing,     setPlaying]     = useState(false);
  const [muted,       setMuted]       = useState(true);
  const [ready,       setReady]       = useState(false);
  const [trackIndex,  setTrackIndex]  = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration,    setDuration]    = useState(0);

  // Poll position every second while playing
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      if (!playerRef.current) return;
      setCurrentTime(playerRef.current.getCurrentTime());
      setDuration(d => d || playerRef.current!.getDuration());
    }, 1000);
    return () => clearInterval(id);
  }, [playing]);

  useEffect(() => {
    function initPlayer() {
      if (!containerRef.current || !window.YT?.Player) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: TRACKS[0].id,
        playerVars: {
          autoplay: 1,
          controls: 0, disablekb: 1, fs: 0,
          modestbranding: 1, rel: 0, mute: 1,
          // No loop/playlist — we handle advancement manually
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
              const next = (trackIndexRef.current + 1) % TRACKS.length;
              trackIndexRef.current = next;
              setTrackIndex(next);
              playerRef.current?.loadVideoById(TRACKS[next].id);
              if (!mutedRef.current) {
                playerRef.current?.unMute();
                playerRef.current?.setVolume(80);
              }
              setCurrentTime(0);
              setDuration(0);
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

  function startWithSound() {
    if (!playerReadyRef.current) { pendingStartRef.current = true; return; }
    playerRef.current?.unMute();
    playerRef.current?.setVolume(80);
    playerRef.current?.playVideo();
    mutedRef.current = false;
    setMuted(false);
    setPlaying(true);
  }

  function loadTrack(idx: number) {
    trackIndexRef.current = idx;
    setTrackIndex(idx);
    playerRef.current?.loadVideoById(TRACKS[idx].id);
    if (!mutedRef.current) { playerRef.current?.unMute(); playerRef.current?.setVolume(80); }
    setCurrentTime(0);
    setDuration(0);
  }

  function nextTrack() { loadTrack((trackIndex + 1) % TRACKS.length); }
  function prevTrack() { loadTrack((trackIndex - 1 + TRACKS.length) % TRACKS.length); }

  function seek(s: number) {
    playerRef.current?.seekTo(s, true);
    setCurrentTime(s);
  }

  function toggleMute() {
    if (!playerRef.current) return;
    if (muted) { playerRef.current.unMute(); playerRef.current.setVolume(80); mutedRef.current = false; setMuted(false); }
    else        { playerRef.current.mute();  mutedRef.current = true;  setMuted(true); }
  }

  function togglePlay() {
    if (!playerRef.current) return;
    playing ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
  }

  return (
    <MusicContext.Provider value={{
      playing, muted, ready, trackIndex,
      trackTitle: TRACKS[trackIndex].title,
      currentTime, duration,
      togglePlay, toggleMute, nextTrack, prevTrack, seek, startWithSound,
    }}>
      <div ref={containerRef} style={{ width: 1, height: 1, position: 'fixed', opacity: 0, pointerEvents: 'none', bottom: 0, left: 0 }} />
      {children}
    </MusicContext.Provider>
  );
}

/** Compact inline controls — buttons + thin scrubber */
export function MusicControls({ className = '' }: { className?: string }) {
  const { playing, muted, ready, trackTitle, currentTime, duration, togglePlay, toggleMute, nextTrack, prevTrack, seek } = useContext(MusicContext);

  return (
    <div className={`flex flex-col gap-0.5 ${className}`} dir="ltr">
      <div className="flex items-center gap-0.5">
        <button onClick={prevTrack} disabled={!ready} aria-label="prev"
          className="text-[11px] px-1 py-0.5 text-ocean-500 disabled:opacity-30 hover:text-ocean-700">⏮</button>
        <button onClick={togglePlay} disabled={!ready} aria-label={playing ? 'pause' : 'play'}
          className="text-[12px] px-1 py-0.5 text-ocean-700 disabled:opacity-30">
          {playing ? '⏸' : '▶'}
        </button>
        <button onClick={nextTrack} disabled={!ready} aria-label="next"
          className="text-[11px] px-1 py-0.5 text-ocean-500 disabled:opacity-30 hover:text-ocean-700">⏭</button>
        <span className="text-[9px] text-ocean-700/50 max-w-[64px] truncate mx-1">{trackTitle}</span>
        <button onClick={toggleMute} disabled={!ready}
          className={`text-[11px] px-1 py-0.5 disabled:opacity-30 ${muted ? 'opacity-30' : 'text-ocean-700'}`}>
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
      {/* Thin scrubber */}
      {ready && duration > 0 && (
        <div className="flex items-center gap-1" dir="ltr">
          <span className="text-[8px] text-ocean-700/40 tabular-nums">{fmt(currentTime)}</span>
          <input type="range" min={0} max={duration} step={1} value={currentTime}
            onChange={e => seek(Number(e.target.value))}
            className="flex-1 h-[3px] accent-ocean-500 cursor-pointer"
            style={{ minWidth: 50 }}
          />
          <span className="text-[8px] text-ocean-700/40 tabular-nums">{fmt(duration)}</span>
        </div>
      )}
    </div>
  );
}

// Floating pill — mobile only (hidden on desktop since controls are in the header)
export function MusicPlayer() {
  return (
    <div className="fixed bottom-20 left-3 z-50 lg:hidden" dir="ltr">
      <div className="bg-white border border-ocean-100 shadow-card rounded-2xl px-3 py-2">
        <MusicControls />
      </div>
    </div>
  );
}
