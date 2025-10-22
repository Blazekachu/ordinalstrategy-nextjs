'use client';

import { useEffect, useState, useRef } from 'react';

interface MagnifyLensProps {
  intensity?: number; // How strong the magnification is (1.0 - 3.0)
  radius?: number; // Radius of the lens effect in pixels
  enabled?: boolean; // Whether the effect is enabled
}

export default function MagnifyLens({ 
  intensity = 1.2, 
  radius = 35, // 2-3 letters wide
  enabled = true 
}: MagnifyLensProps) {
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });
  const rafRef = useRef<number | null>(null);
  const lastProcessedTime = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      // Cleanup on disable
      document.querySelectorAll('.magnify-target').forEach((element) => {
        const el = element as HTMLElement;
        el.style.transform = '';
        el.style.transition = '';
        el.style.willChange = '';
      });
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      
      // Throttle to 60fps for smooth performance
      if (now - lastProcessedTime.current < 16) return;
      lastProcessedTime.current = now;

      setMousePosition({ x: e.clientX, y: e.clientY });

      // Cancel previous animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Use requestAnimationFrame for smooth animation
      rafRef.current = requestAnimationFrame(() => {
        // Only magnify elements with .magnify-target class
        const targets = document.querySelectorAll('.magnify-target');
        
        targets.forEach((element) => {
          const rect = element.getBoundingClientRect();
          const elementCenterX = rect.left + rect.width / 2;
          const elementCenterY = rect.top + rect.height / 2;
          
          // Calculate distance from cursor to element center
          const distanceX = e.clientX - elementCenterX;
          const distanceY = e.clientY - elementCenterY;
          const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
          
          const el = element as HTMLElement;
          
          if (distance < radius) {
            // Smooth quadratic easing for natural falloff
            const falloff = 1 - (distance / radius);
            const smoothFalloff = falloff * falloff;
            const scale = 1 + (intensity - 1) * smoothFalloff;
            
            el.style.transform = `scale(${scale})`;
            el.style.transformOrigin = 'center';
            el.style.transition = 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            el.style.willChange = 'transform';
            el.style.zIndex = '50';
          } else {
            el.style.transform = 'scale(1)';
            el.style.transition = 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            el.style.zIndex = '';
          }
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      // Reset all transforms on unmount
      document.querySelectorAll('.magnify-target').forEach((element) => {
        const el = element as HTMLElement;
        el.style.transform = '';
        el.style.transition = '';
        el.style.willChange = '';
        el.style.zIndex = '';
      });
    };
  }, [enabled, intensity, radius]);

  if (!enabled) return null;

  return (
    <>
      {/* Small Magnifying Glass Visual - subtle and thin */}
      <div
        className="pointer-events-none fixed transition-opacity duration-200"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
          transform: 'translate(-50%, -50%)',
          zIndex: 10000,
          opacity: mousePosition.x < 0 ? 0 : 0.5,
        }}
      >
        {/* Thin glass lens - 2-3 letters wide */}
        <div
          className="rounded-full"
          style={{
            width: radius * 2,
            height: radius * 2,
            border: '1.5px solid rgba(247,147,26,0.4)',
            background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.1), rgba(247,147,26,0.05), transparent 70%)',
            boxShadow: '0 0 6px rgba(247,147,26,0.25)',
          }}
        >
          {/* Tiny center dot for precision */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-0.5 bg-[#f7931a] rounded-full opacity-60" 
          />
        </div>
      </div>
    </>
  );
}
