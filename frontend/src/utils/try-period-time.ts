import type { TryPeriodInfo } from '@/types/order';
import type { ShippingType } from '@/types/order';

// Calculate time remaining in seconds for a try period
export const calculateTimeRemaining = (tryPeriod: TryPeriodInfo): number => {
  if (!tryPeriod.endsAt || tryPeriod.status !== 'active') return 0;
  
  const now = new Date().getTime();
  const end = new Date(tryPeriod.endsAt).getTime();
  return Math.max(0, Math.floor((end - now) / 1000));
};

// Get time phases based on shipping type
export const getTimePhases = (shippingType: ShippingType, totalDuration: number) => {
  if (shippingType === 'premium') {
    // Premium: 1 min courtesy + 15 min try + 1 min courtesy = 17 min total
    return {
      courtesyStart: 60,
      tryPeriod: 15 * 60,
      courtesyEnd: 60,
      total: totalDuration,
    };
  } else {
    // Advanced: 1 min courtesy + 8 min try + 1 min courtesy = 10 min total
    return {
      courtesyStart: 60,
      tryPeriod: 8 * 60,
      courtesyEnd: 60,
      total: totalDuration,
    };
  }
};

// Determine current phase and phase-specific time remaining
export const getCurrentPhaseInfo = (timeRemaining: number, timePhases: ReturnType<typeof getTimePhases>) => {
  if (timeRemaining > timePhases.courtesyEnd + timePhases.tryPeriod) {
    // First courtesy period
    const phaseTimeRemaining = timeRemaining - (timePhases.courtesyEnd + timePhases.tryPeriod);
    return {
      phase: 'courtesy-start' as const,
      phaseTimeRemaining,
      phaseDuration: timePhases.courtesyStart,
    };
  } else if (timeRemaining > timePhases.courtesyEnd) {
    // Try period
    const phaseTimeRemaining = timeRemaining - timePhases.courtesyEnd;
    return {
      phase: 'try-period' as const,
      phaseTimeRemaining,
      phaseDuration: timePhases.tryPeriod,
    };
  } else if (timeRemaining > 0) {
    // Final courtesy period
    return {
      phase: 'courtesy-end' as const,
      phaseTimeRemaining: timeRemaining,
      phaseDuration: timePhases.courtesyEnd,
    };
  }
  return {
    phase: 'expired' as const,
    phaseTimeRemaining: 0,
    phaseDuration: 0,
  };
};