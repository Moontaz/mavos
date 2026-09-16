"use client";

import Link from "next/link";
import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";

export default function NotFound() {
   const ref = useRef<HTMLElement>(null);
   useLayoutEffect(() => {
      if (ref.current)
         gsap.fromTo(
            ref.current.querySelectorAll("[data-404]"),
            { opacity: 0, y: 18 },
            {
               opacity: 1,
               y: 0,
               duration: 0.7,
               stagger: 0.08,
               ease: "power4.out",
            },
         );
   }, []);
   return (
      <main className="not-found page-frame" ref={ref}>
         <span className="eyebrow" data-404>
            ERROR / 404
         </span>
         <h1 data-404>
            THIS PAGE
            <br />
            <em>DIDN’T LISTEN.</em>
         </h1>
         <p data-404>The route you asked for slipped out of range.</p>
         <Link className="button button-dark" href="/" data-404>
            Return home <span>↗</span>
         </Link>
      </main>
   );
}
