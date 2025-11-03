import React from 'react';

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
      className={`w-full bg-gray-200 rounded-full overflow-hidden ${className}`}
      {...props}
    >
      <div
        style={{ width: `${pct}%` }}
        className="h-full rounded-full transition-all duration-200"
      />
    </div>
  );
};

export default Progress;
