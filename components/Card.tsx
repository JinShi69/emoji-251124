import React, { useState, useEffect, useRef } from 'react';
import { EmojiCard } from '../constants';
import ProgressBar from './ProgressBar';

interface CardProps {
  data: EmojiCard;
  index: number;
}

type GenerationStatus = 'idle' | 'generating' | 'revealed';

const Card: React.FC<CardProps> = ({ data, index }) => {
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [noiseSeed, setNoiseSeed] = useState(0); // State for randomizing noise
  const intervalRef = useRef<number | null>(null);

  const startGeneration = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent drag/click conflicts in carousel
    if (status !== 'idle') return;
    
    setStatus('generating');
    setProgress(0);
    
    // 6 seconds duration
    const duration = 6000;
    const intervalTime = 50; // Update every 50ms
    const steps = duration / intervalTime;
    const increment = 100 / steps;

    intervalRef.current = window.setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 100;
        }
        return next;
      });
      setNoiseSeed(Math.random() * 100);
    }, intervalTime);
  };

  useEffect(() => {
    if (progress >= 100 && status === 'generating') {
      setStatus('revealed');
    }
  }, [progress, status]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const filterId = `noise-filter-${index}`;

  // Calculate dynamic filters for "Denoising / Super-Resolution" effect
  const p = progress / 100;
  const inverseP = 1 - p;
  
  // Blur: Curve ensures it stays blurry longer and snaps to focus at the end
  // (Squared inverse creates a parabolic ease-out)
  const blurAmount = status === 'generating' ? 24 * (inverseP * inverseP) : 0;
  
  // Grayscale: Linear fade from BW to Color
  const grayscaleAmount = status === 'generating' ? 100 * inverseP : 0;
  
  // Contrast: Start high (noisy signal) and settle to normal
  const contrastAmount = status === 'generating' ? 1 + (0.4 * inverseP) : 1;
  
  // Brightness: Start slightly washed out/bright
  const brightnessAmount = status === 'generating' ? 1 + (0.2 * inverseP) : 1;

  // Scale: Subtle breathing effect during generation
  const scaleAmount = status === 'generating' ? 1.05 + (0.02 * Math.sin(p * Math.PI * 8)) : 1;
  
  // Noise: Start strong, fade out
  const noiseOpacity = status === 'generating' ? 0.5 * inverseP : 0;

  return (
    <>
      <style>{`
        @keyframes shine-sweep {
          0% { transform: translateX(-150%) skewX(-25deg); opacity: 0; }
          10% { opacity: 0.9; }
          50% { transform: translateX(250%) skewX(-25deg); opacity: 0.9; }
          51% { opacity: 0; }
          100% { transform: translateX(250%) skewX(-25deg); opacity: 0; }
        }
        .animate-shine {
          animation: shine-sweep 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
      <div 
        onClick={startGeneration}
        className="group relative w-80 h-80 rounded-[2rem] overflow-hidden cursor-pointer select-none 
          bg-gradient-to-br from-white/80 via-white/50 to-white/20
          backdrop-blur-md
          border border-white/60
          shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_15px_35px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.01)]
          transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
          hover:shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_30px_60px_-12px_rgba(0,0,0,0.12)]
          hover:scale-[1.02]
          hover:-translate-y-1"
      >
        {/* 
          Glossy Specular Highlight (Liquid Glass effect)
          This gradient adds the "shine" to the top-left corner
        */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent opacity-70 pointer-events-none z-[40]" />
        
        {/* 
          LAYER 1: LOCKED / TEXT STATE
        */}
        <div className={`absolute inset-0 z-10 p-8 flex flex-col items-center justify-center text-center transition-opacity duration-500 ${status === 'idle' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex flex-col gap-2 relative z-50">
            <h3 className="text-3xl font-bold text-zinc-800 leading-tight tracking-tight drop-shadow-sm">
              {data.title.split(' (')[0]}
            </h3>
            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
              {data.title.split(' (')[1]?.replace(')', '') || 'Artifact'}
            </p>
          </div>
          <div className="mt-6 relative z-50">
            <p className="text-sm text-zinc-500 font-light leading-relaxed mix-blend-multiply">
              {data.description}
            </p>
          </div>
        </div>

        {/* 
          LAYER 2: GENERATING OVERLAY (Progress)
        */}
        <div className={`absolute inset-0 z-30 flex flex-col items-center justify-center transition-opacity duration-500 ${status === 'generating' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[4px]" />
          <div className="relative z-10 flex flex-col items-center">
            <ProgressBar progress={progress} size={80} strokeWidth={4} />
            <div className="mt-6 text-center space-y-1">
              <div className="text-emerald-600 text-xs font-mono font-bold tracking-[0.2em] animate-pulse">
                GENERATING
              </div>
            </div>
          </div>
        </div>

        {/* 
          LAYER 3: IMAGE & NOISE & SHIMMER
        */}
        <div 
          className={`absolute inset-0 z-20 bg-transparent overflow-hidden transition-opacity duration-1000 ease-out ${status !== 'idle' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <img 
            src={data.url} 
            alt={data.title}
            className="w-full h-full object-cover transition-transform duration-100 ease-linear mix-blend-multiply opacity-95"
            style={{
              filter: status === 'generating' 
                ? `blur(${blurAmount}px) grayscale(${grayscaleAmount}%) contrast(${contrastAmount}) brightness(${brightnessAmount})` 
                : 'none',
              transform: `scale(${scaleAmount})`
            }}
          />

          {/* Dynamic Noise Overlay */}
          {status === 'generating' && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay" style={{ opacity: noiseOpacity }}>
              <filter id={filterId}>
                <feTurbulence 
                  type="fractalNoise" 
                  baseFrequency="0.85" 
                  numOctaves="3" 
                  stitchTiles="stitch" 
                  seed={noiseSeed} 
                />
                <feColorMatrix type="saturate" values="0" /> 
              </filter>
              <rect width="100%" height="100%" filter={`url(#${filterId})`} />
            </svg>
          )}

          {/* Shimmer Effect (Only once revealed) */}
          {status === 'revealed' && (
             <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
               <div className="absolute inset-0 w-[200%] h-full animate-shine bg-gradient-to-r from-transparent via-white/50 to-transparent mix-blend-soft-light" />
             </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Card;