'use client';

import { useState, useRef, useEffect } from 'react';

interface ScrollButtonProps {
  text: string;
  onComplete: () => void;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
}

export default function ScrollButton({
  text,
  onComplete,
  backgroundColor = '#f7931a',
  textColor = '#0b0c10',
  accentColor = '#ffffff',
}: ScrollButtonProps) {
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [completed, setCompleted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  const threshold = 0.9; // 90% completion triggers action

  useEffect(() => {
    if (progress >= threshold && !completed) {
      setCompleted(true);
      onComplete();
    }
  }, [progress, completed, onComplete]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current || !handleRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const handleWidth = handleRef.current.offsetWidth;
    const maxTravel = rect.width - handleWidth;
    
    // Calculate position relative to container
    const x = e.clientX - rect.left - handleWidth / 2;
    const clampedX = Math.max(0, Math.min(x, maxTravel));
    const newProgress = clampedX / maxTravel;

    setProgress(newProgress);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    // If not completed, slide back
    if (progress < threshold) {
      setProgress(0);
    }
  };

  const handleStyle = {
    left: `${progress * 100}%`,
    transform: completed ? 'scale(1.1)' : isDragging ? 'scale(1.05)' : 'scale(1)',
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[280px] h-14 rounded-full overflow-hidden cursor-pointer select-none"
      style={{
        backgroundColor: `${backgroundColor}20`,
        border: `2px solid ${backgroundColor}`,
      }}
    >
      {/* Progress Background */}
      <div
        className="absolute inset-0 transition-all duration-200"
        style={{
          width: `${progress * 100}%`,
          backgroundColor: `${backgroundColor}40`,
        }}
      />

      {/* Text */}
      <div
        className="absolute inset-0 flex items-center justify-center font-bold text-base pointer-events-none z-10 px-14"
        style={{
          color: progress > 0.5 ? accentColor : backgroundColor,
          transition: 'color 0.2s',
        }}
      >
        {text.toUpperCase()}
      </div>

      {/* Draggable Handle */}
      <div
        ref={handleRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="absolute top-1 bottom-1 w-12 rounded-full transition-transform duration-200 touch-none z-20"
        style={{
          ...handleStyle,
          backgroundColor: backgroundColor,
          boxShadow: `0 4px 12px rgba(247, 147, 26, ${isDragging ? 0.6 : 0.3})`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        <div
          className="w-full h-full flex items-center justify-center text-xl"
          style={{ color: textColor }}
        >
          →
        </div>
      </div>
    </div>
  );
}

