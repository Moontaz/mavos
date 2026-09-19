import type { Project } from "@/lib/types";

export const projects: Project[] = [
   {
      slug: "saling-pandu",
      index: "01",
      title: "Saling Pandu",
      type: "Digital platform",
      year: "2026",
      description:
         "A focused digital experience designed to make guidance feel direct, human, and easy to find.",
      role: "Frontend / Interaction",
      technologies: ["Next.js", "TypeScript", "GSAP"],
      features: [
         "Editorial information architecture",
         "Responsive interaction system",
         "Motion-led navigation",
      ],
      accent: "SP",
   },
   {
      slug: "smile-detector",
      index: "02",
      title: "Smile Detector",
      type: "Browser experiment",
      year: "2023",
      description:
         "A playful computer-vision experiment that turns a live camera signal into an immediate interface response.",
      role: "Creative development",
      technologies: ["JavaScript", "Canvas", "Web APIs"],
      features: [
         "Realtime browser input",
         "Canvas feedback loop",
         "Deliberately simple visual language",
      ],
      accent: "SD",
   },
   {
      slug: "mavos",
      index: "03",
      title: "MAVOS",
      type: "Voice interface",
      year: "2026",
      description:
         "A portfolio experiment exploring voice as a first-class navigation system for the web.",
      role: "Design / Engineering",
      technologies: ["React", "Web Speech API", "Web Audio API", "GSAP"],
      features: [
         "Natural-language commands",
         "Realtime audio visualization",
         "Accessible keyboard fallback",
      ],
      accent: "MV",
   },
];

export const getProject = (slug: string) =>
   projects.find((project) => project.slug === slug);
