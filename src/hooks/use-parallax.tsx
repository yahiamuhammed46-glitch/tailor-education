import { useEffect, useState, useCallback, RefObject } from "react";

interface ParallaxOptions {
  speed?: number;
  direction?: "up" | "down";
}

export const useParallax = (options: ParallaxOptions = {}) => {
  const { speed = 0.5, direction = "up" } = options;
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const multiplier = direction === "up" ? -1 : 1;
      setOffset(scrollY * speed * multiplier);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed, direction]);

  return offset;
};

export const useElementParallax = (
  ref: RefObject<HTMLElement>,
  options: ParallaxOptions = {}
) => {
  const { speed = 0.3 } = options;
  const [transform, setTransform] = useState({ y: 0, opacity: 1, scale: 1 });

  const handleScroll = useCallback(() => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const elementCenter = rect.top + rect.height / 2;
    const distanceFromCenter = elementCenter - windowHeight / 2;
    const normalizedDistance = distanceFromCenter / windowHeight;

    const y = normalizedDistance * speed * 100;
    const opacity = Math.max(0.3, 1 - Math.abs(normalizedDistance) * 0.5);
    const scale = Math.max(0.95, 1 - Math.abs(normalizedDistance) * 0.05);

    setTransform({ y, opacity, scale });
  }, [ref, speed]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return transform;
};

export const useScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollTop = window.scrollY;
      setProgress(scrollHeight > 0 ? scrollTop / scrollHeight : 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return progress;
};
