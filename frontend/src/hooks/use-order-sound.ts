import { useCallback, useRef, useState, useEffect } from 'react';

interface UseOrderSoundOptions {
  enabled?: boolean;
  volume?: number;
  cooldownMs?: number;
}

interface UseOrderSoundReturn {
  playOrderSound: () => Promise<void>;
  isPlaying: boolean;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  lastPlayedAt: number | null;
}

export function useOrderSound(options: UseOrderSoundOptions = {}): UseOrderSoundReturn {
  const {
    enabled: initialEnabled = true,
    volume = 0.7,
    cooldownMs = 5000, // 5 second cooldown to prevent spam
  } = options;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnabled, setIsEnabledState] = useState(initialEnabled);
  const [lastPlayedAt, setLastPlayedAt] = useState<number | null>(null);

  // Wrapper function to update enabled state
  const setEnabled = useCallback((enabled: boolean) => {
    setIsEnabledState(enabled);
  }, []);

  // Initialize audio on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/new_order.mp3');
      audioRef.current.volume = volume;
      audioRef.current.preload = 'auto';

      // Add event listeners
      const audio = audioRef.current;

      const handlePlay = () => setIsPlaying(true);
      const handleEnded = () => setIsPlaying(false);
      const handleError = (e: Event) => {
        console.error('Audio playback error:', e);
        setIsPlaying(false);
      };

      audio.addEventListener('play', handlePlay);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      return () => {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
      };
    }
  }, [volume]);

  const playOrderSound = useCallback(async (): Promise<void> => {
    console.log('🔊 playOrderSound called:', {
      isEnabled,
      hasAudio: !!audioRef.current,
      lastPlayedAt,
      cooldownMs,
      isPlaying,
      timeSinceLastPlay: lastPlayedAt ? Date.now() - lastPlayedAt : 'never'
    });

    if (!isEnabled || !audioRef.current) {
      console.log('🔊 Sound blocked: isEnabled=', isEnabled, 'hasAudio=', !!audioRef.current);
      return;
    }

    const now = Date.now();

    // Check cooldown
    if (lastPlayedAt && (now - lastPlayedAt) < cooldownMs) {
      console.log('Sound cooldown active, skipping playback');
      return;
    }

    // Stop any currently playing audio
    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    try {
      // Reset audio to beginning
      audioRef.current.currentTime = 0;

      console.log('🔊 Attempting to play audio...');
      // Attempt to play
      await audioRef.current.play();
      setLastPlayedAt(now);

      console.log('🔊 Order notification sound played successfully');
    } catch (error) {
      console.warn('🔊 Could not play order notification sound:', error);

      // If autoplay is blocked, we could show a notification to the user
      // or set up a click handler to enable audio
      if (error instanceof Error && error.name === 'NotAllowedError') {
        console.warn('🔊 Audio autoplay blocked. User interaction required.');
      }
    }
  }, [isEnabled, lastPlayedAt, cooldownMs, isPlaying]);

  // Enable audio after user interaction (helps with autoplay policies)
  const enableAudioAfterInteraction = useCallback(() => {
    if (audioRef.current && typeof window !== 'undefined') {
      // Create a silent audio context to enable audio
      audioRef.current.muted = true;
      audioRef.current.play().then(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.muted = false;
          audioRef.current.currentTime = 0;
        }
      }).catch(() => {
        // Ignore errors for this enablement attempt
      });
    }
  }, []);

  // Auto-enable audio on first user interaction
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleFirstInteraction = () => {
        enableAudioAfterInteraction();
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
      };

      document.addEventListener('click', handleFirstInteraction);
      document.addEventListener('keydown', handleFirstInteraction);

      return () => {
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
      };
    }
  }, [enableAudioAfterInteraction]);

  return {
    playOrderSound,
    isPlaying,
    isEnabled,
    setEnabled,
    lastPlayedAt,
  };
}