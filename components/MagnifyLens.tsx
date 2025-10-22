'use client';

import { useEffect, useState } from 'react';

interface MagnifyLensProps {
  intensity?: number; // How strong the magnification is (1.0 - 3.0)
  radius?: number; // Radius of the lens effect in pixels
  enabled?: boolean; // Whether the effect is enabled
}

export default function MagnifyLens({ 
  intensity = 1.8, 
  radius = 120,
  enabled = true 
}: MagnifyLensProps) {
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    if (!enabled) {
      document.body.style.cursor = 'default';
      return;
    }

    // Hide default cursor globally
    document.body.style.cursor = 'none';
    
    // Add cursor: none to all interactive elements
    const style = document.createElement('style');
    style.textContent = `
      * {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });

      // Apply magnify effect to ALL elements (text, images, everything)
      const elements = document.querySelectorAll('*:not(html):not(body):not(script):not(style)');
      
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const elementCenterX = rect.left + rect.width / 2;
        const elementCenterY = rect.top + rect.height / 2;
        
        // Calculate distance from cursor to element center
        const distance = Math.sqrt(
          Math.pow(e.clientX - elementCenterX, 2) + 
          Math.pow(e.clientY - elementCenterY, 2)
        );
        
        // Calculate scale based on distance
        let scale = 1;
        if (distance < radius) {
          const normalizedDistance = distance / radius;
          scale = 1 + (intensity - 1) * (1 - normalizedDistance);
        }
        
        // Apply transform with smooth transition
        const el = element as HTMLElement;
        if (scale > 1.01) {
          el.style.transform = `scale(${scale})`;
          el.style.transformOrigin = 'center';
          el.style.transition = 'transform 0.15s ease-out';
          el.style.zIndex = '100';
          el.style.position = 'relative';
        } else {
          el.style.transform = 'scale(1)';
          el.style.zIndex = '';
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.style.cursor = 'default';
      style.remove();
      
      // Reset all transforms on unmount
      const elements = document.querySelectorAll('*');
      elements.forEach((element) => {
        const el = element as HTMLElement;
        el.style.transform = '';
        el.style.zIndex = '';
        el.style.position = '';
      });
    };
  }, [enabled, intensity, radius]);

  if (!enabled) return null;

  return (
    <>
      {/* Magnifying Glass Visual */}
      <div
        className="pointer-events-none fixed"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
          transform: 'translate(-50%, -50%)',
          zIndex: 10000,
        }}
      >
        {/* Glass lens with border and shine effect */}
        <div
          className="rounded-full border-4 border-[#f7931a]/80 shadow-[0_0_30px_rgba(247,147,26,0.6)]"
          style={{
            width: radius * 2,
            height: radius * 2,
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), rgba(247,147,26,0.1), transparent)',
            backdropFilter: 'blur(1px)',
          }}
        >
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#f7931a] rounded-full" />
          
          {/* Glass shine effect */}
          <div 
            className="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-white/40 rounded-full blur-xl"
          />
        </div>
      </div>
    </>
  );
}

