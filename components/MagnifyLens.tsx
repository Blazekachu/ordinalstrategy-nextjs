'use client';

import { useEffect, useState } from 'react';

interface MagnifyLensProps {
  intensity?: number; // How strong the magnification is (1.0 - 2.0)
  radius?: number; // Radius of the lens effect in pixels
  enabled?: boolean; // Whether the effect is enabled
}

export default function MagnifyLens({ 
  intensity = 1.3, 
  radius = 150,
  enabled = true 
}: MagnifyLensProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });

      // Apply magnify effect to elements
      const elements = document.querySelectorAll('.magnify-target');
      
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
        
        // Apply transform
        (element as HTMLElement).style.transform = `scale(${scale})`;
        (element as HTMLElement).style.transition = 'transform 0.2s ease-out';
        (element as HTMLElement).style.zIndex = distance < radius ? '10' : '1';
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      
      // Reset all transforms on unmount
      const elements = document.querySelectorAll('.magnify-target');
      elements.forEach((element) => {
        (element as HTMLElement).style.transform = 'scale(1)';
        (element as HTMLElement).style.zIndex = '1';
      });
    };
  }, [enabled, intensity, radius]);

  if (!enabled) return null;

  return (
    <>
      {/* Optional: Visual cursor indicator */}
      <div
        className="pointer-events-none fixed rounded-full border-2 border-[#f7931a]/30 transition-opacity duration-300"
        style={{
          left: mousePosition.x - radius,
          top: mousePosition.y - radius,
          width: radius * 2,
          height: radius * 2,
          opacity: 0.3,
          zIndex: 9999,
        }}
      />
    </>
  );
}

