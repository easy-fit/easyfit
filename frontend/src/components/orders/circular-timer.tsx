'use client';

import { formatTime } from '@/utils/formatters';
import { getPhaseInfo } from '@/utils/try-period-phases';

interface CircularTimerProps {
  timeRemaining: number;
  currentPhase: string;
  phaseDuration: number;
  phaseTimeRemaining: number;
}

export function CircularTimer({ timeRemaining, currentPhase, phaseDuration, phaseTimeRemaining }: CircularTimerProps) {
  const phaseInfo = getPhaseInfo(currentPhase);
  
  // Calculate progress for current phase only
  const phaseProgress = phaseDuration > 0 ? ((phaseDuration - phaseTimeRemaining) / phaseDuration) * 100 : 0;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (phaseProgress / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg className="w-20 h-20 sm:w-24 sm:h-24 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`${phaseInfo.bgColor} transition-all duration-1000 ease-in-out`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-mono text-sm sm:text-lg font-bold ${phaseInfo.color}`}>
            {formatTime(phaseTimeRemaining)}
          </span>
        </div>
      </div>
      <div className="mt-1 sm:mt-2 text-center">
        <p className={`font-semibold ${phaseInfo.color} text-xs sm:text-sm`}>{phaseInfo.label}</p>
        <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">{phaseInfo.description}</p>
      </div>
    </div>
  );
}