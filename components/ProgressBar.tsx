import React from 'react';

interface ProgressBarProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  size = 60, 
  strokeWidth = 4 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background Circle */}
      <svg
        className="transform -rotate-90 w-full h-full"
      >
        <circle
          className="text-zinc-200"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Circle */}
        <circle
          className="text-zinc-900 transition-all duration-200 ease-linear"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute text-xs font-mono font-bold text-zinc-900">
        {Math.round(progress)}%
      </div>
    </div>
  );
};

export default ProgressBar;