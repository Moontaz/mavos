"use client";

import gsap from "gsap";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import type { Project } from "@/lib/types";

export function ProjectDetail({ project }: { project: Project }) {
   const ref = useRef<HTMLElement>(null);
   useLayoutEffect(() => {
      if (!ref.current) return;
      const context = gsap.context(
         () =>
            gsap.fromTo(
               "[data-detail-reveal]",
               { opacity: 0, y: 24 },
               {
                  opacity: 1,
                  y: 0,
                  duration: 0.8,
                  stagger: 0.08,
                  ease: "power4.out",
               },
            ),
         ref,
      );
      return () => context.revert();
   }, []);
   return (
      <main className="detail-page page-frame" ref={ref}>
         <div className="section-kicker" data-detail-reveal>
            <Link href="/projects">← All projects</Link>
            <span>{project.index} / 03</span>
         </div>
         <div className="detail-heading">
            <span className="eyebrow" data-detail-reveal>
               {project.type} / {project.year}
            </span>
            <h1 data-detail-reveal>{project.title}</h1>
            <p data-detail-reveal>{project.description}</p>
         </div>
         <div className="detail-visual" data-detail-reveal>
            <span>{project.accent}</span>
            <small>PROJECT SIGNAL / {project.index}</small>
         </div>
         <div className="detail-columns">
            <div data-detail-reveal>
               <span className="eyebrow">Role</span>
               <p>{project.role}</p>
            </div>
            <div data-detail-reveal>
               <span className="eyebrow">Technologies</span>
               <ul>
                  {project.technologies.map((technology) => (
                     <li key={technology}>{technology}</li>
                  ))}
               </ul>
            </div>
            <div data-detail-reveal>
               <span className="eyebrow">Key features</span>
               <ul>
                  {project.features.map((feature) => (
                     <li key={feature}>{feature}</li>
                  ))}
               </ul>
            </div>
         </div>
         <div className="detail-footer" data-detail-reveal>
            <Link
               className="button button-dark"
               href={project.url ?? "/projects"}
            >
               {project.url ? "Visit project" : "Back to projects"}{" "}
               <span>↗</span>
            </Link>
            <div className="detail-nav">
               <Link
                  href={`/projects/${project.slug === "saling-pandu" ? "smile-detector" : project.slug === "smile-detector" ? "mavos" : "saling-pandu"}`}
               >
                  Next project ↗
               </Link>
            </div>
         </div>
      </main>
   );
}
