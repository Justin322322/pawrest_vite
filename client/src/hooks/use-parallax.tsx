import { useRef, useEffect } from 'react';

function useParallaxEffect<T extends HTMLElement>(speed: number = 0.5) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Set initial background position
    const initialBgPosition = 'center';

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const elementRect = element.getBoundingClientRect();
      const elementTop = window.scrollY + elementRect.top;
      const elementHeight = elementRect.height;
      const windowHeight = window.innerHeight;
      
      // Only apply parallax when element is in view
      if (
        scrollY + windowHeight > elementTop &&
        scrollY < elementTop + elementHeight
      ) {
        // Apply a simpler parallax effect
        const yPos = -(scrollY * speed / 10);
        element.style.backgroundPositionY = `calc(50% + ${yPos}px)`;
      }
    };

    // Initial position
    element.style.backgroundPosition = initialBgPosition;
    
    // Run once to set initial state
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed]);

  return { ref };
}

export { useParallaxEffect as useParallax };
