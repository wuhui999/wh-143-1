import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { TEMP_SAMPLE_RATE } from '../config/levels';

export function useGameLoop() {
  const isPlaying = useGameStore(state => state.isPlaying);
  const updateTick = useGameStore(state => state.updateTick);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        updateTick();
      }, TEMP_SAMPLE_RATE);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, updateTick]);
}
