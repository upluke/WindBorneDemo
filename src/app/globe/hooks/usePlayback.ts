import { useState, useEffect, useCallback, useRef } from 'react';

interface UsePlaybackOptions {
  maxHours?: number;
  intervalMs?: number;
}

interface UsePlaybackReturn {
  selectedHour: number;
  isPlaying: boolean;
  setSelectedHour: (hour: number) => void;
  togglePlayPause: () => void;
  pause: () => void;
}

/**
 * Hook for managing time playback animation
 * 
 * @param options - Configuration options
 * @param options.maxHours - Maximum hours (default 24)
 * @param options.intervalMs - Interval between steps (default 800ms)
 * @returns Playback controls and state
 * 
 * @remarks
 * - Automatically advances selectedHour when playing
 * - Plays from past to present: 23→22→...→1→0 (then loops back to 23)
 * - Pauses when user manually changes hour
 * - Clean interval management with useEffect cleanup
 * 
 * @example
 * ```tsx
 * const { selectedHour, isPlaying, setSelectedHour, togglePlayPause } = usePlayback();
 * ```
 */
export function usePlayback(options: UsePlaybackOptions = {}): UsePlaybackReturn {
  const { maxHours = 24, intervalMs = 800 } = options;
  
  const [selectedHour, setSelectedHourState] = useState(23); // Start at 23 hours ago
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Manual hour change - pause playback
  const setSelectedHour = useCallback((hour: number) => {
    setSelectedHourState(hour);
    setIsPlaying(false); // Pause when user manually changes hour
  }, []);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // Pause playback
  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // Auto-advance animation
  useEffect(() => {
    if (!isPlaying) {
      // Clear interval when paused
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start animation interval
    intervalRef.current = setInterval(() => {
      setSelectedHourState((prev) => {
        // Decrement from 23→0, then loop back to 23
        const next = prev - 1;
        return next < 0 ? maxHours - 1 : next;
      });
    }, intervalMs);

    // Cleanup on unmount or when paused
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, maxHours, intervalMs]);

  return {
    selectedHour,
    isPlaying,
    setSelectedHour,
    togglePlayPause,
    pause,
  };
}

