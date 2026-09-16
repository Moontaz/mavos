'use client';

import gsap from 'gsap';
import Link from 'next/link';
import { useLayoutEffect, useRef } from 'react';
import type { Project } from '@/lib/types';

export function ProjectGrid({ projects }: { projects: Project[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const context = gsap.context(() => gsap.fromTo('.project-card', { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, delay: 0.12, ease: 'power4.out' }), ref);
    return () => context.revert();
  }, []);
  return <div className="project-grid" ref={ref}>{projects.map((project) => <Link className="project-card" href={`/projects/${project.slug}`} key={project.slug}><div className="project-visual"><span className="project-index">{project.index}</span><span className="project-monogram">{project.accent}</span><span className="project-open">VIEW ↗</span></div><div className="project-card-info"><div><h2>{project.title}</h2><p>{project.type}</p></div><span>{project.year}</span></div></Link>)}</div>;
}
