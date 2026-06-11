import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Hook: animates elements into view when they enter the viewport.
 * Returns a ref to attach to the target element and a boolean `isVisible`.
 *
 * Usage:
 *   const [ref, isVisible] = useReveal();
 *   <div ref={ref} className={`reveal ${isVisible ? "revealed" : ""}`}>
 */
export function useReveal(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el); // only animate once
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px", ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
}

/**
 * Hook: applies reveal animation to multiple child elements with staggered delay.
 * Attach the returned ref to the parent container.
 * Children should have className "reveal-child".
 */
export function useStaggerReveal(staggerMs = 80) {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const children = container.querySelectorAll(".reveal-child");
          children.forEach((child, i) => {
            child.style.transitionDelay = `${i * staggerMs}ms`;
            child.classList.add("revealed");
          });
          observer.unobserve(container);
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -30px 0px" }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [staggerMs]);

  return ref;
}
