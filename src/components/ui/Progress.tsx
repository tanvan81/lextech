import React from 'react';

interface ProgressProps {
  value: number; // 0 - 100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={`w-full space-y-1 ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-600">
          <span>Tiến độ học tập</span>
          <span>{clampedValue}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div
          className="h-full bg-indigo-600 rounded-full transition-all duration-300"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};
