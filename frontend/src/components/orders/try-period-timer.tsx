'use client';

import { Clock } from 'lucide-react';
import { formatTime } from '@/utils/formatters';

interface TryPeriodTimerProps {
  timeRemaining: number;
  className?: string;
}

export function TryPeriodTimer({ timeRemaining, className }: TryPeriodTimerProps) {
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <Clock className="w-4 h-4" />
      <span className="font-mono font-bold text-lg">
        {formatTime(timeRemaining)}
      </span>
      <span className="text-sm opacity-80">
        restantes
      </span>
    </div>
  );
}