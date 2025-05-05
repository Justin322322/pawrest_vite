import { useRef, useEffect } from 'react';

export const useParallax = <T extends HTMLElement>(speed: number = 0.5) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const elementTop = element.offsetTop;
      const elementHeight = element.offsetHeight;
      const windowHeight = window.innerHeight;
      
      // Only apply parallax when element is in view
      if (
        scrollY + windowHeight > elementTop &&
        scrollY < elementTop + elementHeight
      ) {
        const offset = (scrollY - elementTop) * speed;
        element.style.backgroundPositionY = `${offset}px`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed]);

  return { ref };
};
