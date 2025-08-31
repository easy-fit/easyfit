import { useState, useEffect } from 'react';
import type { TryPeriodInfo, ShippingType } from '@/types/order';
import { calculateTimeRemaining, getTimePhases, getCurrentPhaseInfo } from '@/utils/try-period-time';

interface UseTryPeriodTimerProps {
  tryPeriod: TryPeriodInfo;
  shippingType: ShippingType;
}

export const useTryPeriodTimer = ({ tryPeriod, shippingType }: UseTryPeriodTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Calculate time remaining
  useEffect(() => {
    if (!tryPeriod.endsAt || tryPeriod.status !== 'active') return;

    const updateTimeRemaining = () => {
      const remaining = calculateTimeRemaining(tryPeriod);
      setTimeRemaining(remaining);
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [tryPeriod]);

  // Get time phases and current phase info
  const timePhases = getTimePhases(shippingType, tryPeriod.duration || 0);
  const phaseInfo = getCurrentPhaseInfo(timeRemaining, timePhases);

  return {
    timeRemaining,
    timePhases,
    currentPhase: phaseInfo.phase,
    phaseTimeRemaining: phaseInfo.phaseTimeRemaining,
    phaseDuration: phaseInfo.phaseDuration,
  };
};