import React, { useRef, useEffect } from 'react';
import { EMOJI_DATA } from '../constants';
import Card from './Card';

const CARD_WIDTH = 320;
const SPACING = 240; // Less than width to allow overlap
const VISIBLE_RANGE_BUFFER = 1000; // Pixels outside viewport to keep rendering

const Carousel: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  // State refs for animation loop
  const scrollOffsetRef = useRef(0);
  const currentGlobalSpeedRef = useRef(0.5); // Controls pause/play inertia
  const isPausedRef = useRef(false);

  // Total width of the virtual track
  const totalWidth = EMOJI_DATA.length * SPACING;

  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      // 1. Calculate Global Inertia (User Interaction)
      // When paused, target is 0. When running, target is 1.
      const targetGlobal = isPausedRef.current ? 0 : 1;
      // Smooth lerp for pause/resume inertia
      currentGlobalSpeedRef.current += (targetGlobal - currentGlobalSpeedRef.current) * 0.05;
      
      // 2. Calculate Rhythmic Speed (Paragraph-style movement)
      // We want the carousel to linger when a card is centered and move fast between cards.
      // Phase: 0.0 = Card Centered, 0.5 = Between Cards, 1.0 = Next Card Centered
      const normalizedPos = Math.abs(scrollOffsetRef.current);
      const phase = (normalizedPos % SPACING) / SPACING;
      
      // Shaping function: (1 - cos(2πx))/2 creates a bell curve 0->1->0
      // We power it to make the "slow" zone wider (lingering longer at center)
      const wave = (1 - Math.cos(phase * 2 * Math.PI)) / 2;
      const sharpWave = Math.pow(wave, 1.5); 
      
      // Speed profile: Min 0.2px/frame (lingering), Max 3.0px/frame (transitioning)
      const minSpeed = 0.2;
      const maxSpeed = 3.5;
      const rhythmicSpeed = minSpeed + (maxSpeed - minSpeed) * sharpWave;

      // 3. Update Position
      // Apply both the user's pause state and the rhythmic curve
      scrollOffsetRef.current += currentGlobalSpeedRef.current * rhythmicSpeed;

      // 4. Render Items
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const centerX = containerWidth / 2;

        itemsRef.current.forEach((item, index) => {
          if (!item) return;

          // Calculate "Virtual" X position
          let itemPos = (index * SPACING - scrollOffsetRef.current) % totalWidth;
          
          // Wrap logic: Ensure itemPos is centered around 0 (relative to track start)
          if (itemPos < -totalWidth / 2) {
            itemPos += totalWidth;
          } else if (itemPos > totalWidth / 2) {
             itemPos -= totalWidth;
          }

          // Screen X coordinate relative to container center
          const distFromCenter = itemPos;
          const absDist = Math.abs(distFromCenter);

          // Optimization: Hide if too far off screen
          if (absDist > containerWidth / 2 + VISIBLE_RANGE_BUFFER) {
            item.style.display = 'none';
            return;
          }
          item.style.display = 'block';

          // ARC LOGIC & OVERLAP
          // Y Offset: Parabola (y = x^2 * k) -> drops down as it moves away from center
          const yOffset = Math.pow(distFromCenter / 500, 2) * 40; 
          
          // Rotation: slight rotation based on X
          const rotation = distFromCenter / 40; 
          
          // Scale: slightly smaller at edges
          const scale = Math.max(0.8, 1 - absDist / 3000);

          // Z-Index: Higher at center
          const zIndex = 1000 - Math.floor(absDist);
          
          // Final X Position (centered in container)
          const finalX = centerX + distFromCenter - (CARD_WIDTH / 2);

          // Apply Styles
          item.style.transform = `translate3d(${finalX}px, ${yOffset}px, 0) scale(${scale}) rotate(${rotation}deg)`;
          item.style.zIndex = zIndex.toString();
          // Fade out edges slightly
          item.style.opacity = Math.max(0, 1 - absDist / (containerWidth * 0.9)).toString();
        });
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [totalWidth]);

  const handleMouseEnter = () => { isPausedRef.current = true; };
  const handleMouseLeave = () => { isPausedRef.current = false; };

  return (
    <div 
      className="w-full relative h-[450px] overflow-hidden cursor-grab active:cursor-grabbing"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseEnter}
      onTouchEnd={handleMouseLeave}
      ref={containerRef}
    >
      <div className="absolute inset-0 flex items-center">
         {EMOJI_DATA.map((item, index) => (
           <div
             key={item.id}
             ref={(el) => { itemsRef.current[index] = el; }}
             className="absolute top-8 left-0 will-change-transform"
             style={{ width: CARD_WIDTH, height: 320 }}
           >
             <Card data={item} index={index} />
           </div>
         ))}
      </div>
      
      {/* Edge Gradients for smooth fade out */}
      <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-zinc-50 to-transparent z-[2000] pointer-events-none" />
      <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-zinc-50 to-transparent z-[2000] pointer-events-none" />
    </div>
  );
};

export default Carousel;