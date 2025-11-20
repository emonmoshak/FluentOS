import React from 'react';

interface BlobVisualizerProps {
  volume: number; // 0 to 255 typically
  state: 'listening' | 'speaking' | 'connecting' | 'idle';
}

export const BlobVisualizer: React.FC<BlobVisualizerProps> = ({ volume, state }) => {
  // Normalize volume for scaling
  // Base scale is 1. Add volume influence.
  const scale = 1 + (volume / 255) * 0.5;

  return (
    <div className="relative flex items-center justify-center w-80 h-80">
      {/* Outer Glow / Ripple */}
      <div 
        className={`absolute rounded-full bg-yellow-300 mix-blend-multiply filter blur-xl opacity-30 transition-all duration-200 ease-out`}
        style={{
            width: '120%',
            height: '120%',
            transform: `scale(${state === 'speaking' ? scale * 1.2 : 1})`,
        }}
      />
      
      {/* Main Blob */}
      <div 
        className={`relative w-48 h-48 rounded-full bg-yellow-400 blob-shadow flex items-center justify-center transition-all duration-100 ease-linear z-10`}
        style={{
            transform: `scale(${state === 'speaking' ? scale : 1})`,
        }}
      >
        {state === 'connecting' && (
             <div className="w-8 h-8 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin opacity-50" />
        )}
      </div>

      {/* Idle Breathing Animation Ring (when not speaking) */}
      {state === 'listening' && (
          <div className="absolute w-48 h-48 rounded-full border-2 border-yellow-200 animate-ping opacity-20" />
      )}
    </div>
  );
};
