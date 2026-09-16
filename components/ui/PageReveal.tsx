"use client";

import gsap from "gsap";
import { ReactNode, useLayoutEffect, useRef } from "react";

export function PageReveal({
   children,
   className = "",
}: {
   children: ReactNode;
   className?: string;
}) {
   const ref = useRef<HTMLDivElement>(null);
   useLayoutEffect(() => {
      const element = ref.current;
      if (
         !element ||
         window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
         return;
      const context = gsap.context(() => {
         gsap.fromTo(
            element,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.75, ease: "power4.out" },
         );
         gsap.fromTo(
            element.querySelectorAll("[data-stagger]"),
            { opacity: 0, y: 22 },
            {
               opacity: 1,
               y: 0,
               duration: 0.75,
               stagger: 0.06,
               delay: 0.08,
               ease: "power4.out",
            },
         );
      }, ref);
      return () => context.revert();
   }, []);
   return (
      <div ref={ref} className={className}>
         {children}
      </div>
   );
}
