import React from 'react';
import { cn } from '@/lib/utils';

export const Progress = ({ value = 0, max = 100, className = '', ariaLabel = 'progress', ...props }) => {
  const safeValue = isNaN(Number(value)) ? 0 : Number(value);
  const pct = Math.max(0, Math.min(100, (safeValue / max) * 100));

  return (
    <div
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={safeValue}
      className={cn("w-full bg-muted rounded-full overflow-hidden", className)}
      {...props}
    >
      <div
        style={{ width: `${pct}%` }}
        className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
      />
    </div>
  );
};

export default Progress;
