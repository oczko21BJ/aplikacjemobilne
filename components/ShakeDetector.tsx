import { useEffect } from 'react';
import { Accelerometer } from 'expo-sensors';

interface ShakeDetectorProps {
  onShake: () => void;
  threshold?: number;
  enabled?: boolean;
}

export function ShakeDetector({ 
  onShake, 
  threshold = 1.5, 
  enabled = true 
}: ShakeDetectorProps) {
  useEffect(() => {
    if (!enabled) return;

    const subscription = Accelerometer.addListener(data => {
      const acceleration = Math.sqrt(
        data.x * data.x + data.y * data.y + data.z * data.z
      );
      
      if (acceleration > threshold) {
        onShake();
      }
    });

    Accelerometer.setUpdateInterval(100);

    return () => {
      subscription.remove();
    };
  }, [onShake, threshold, enabled]);

  return null;
}