import Link from "next/link";
import { PageReveal } from "@/components/ui/PageReveal";

const skills = [
   ["Frontend", "React", "Next.js", "TypeScript", "JavaScript"],
   ["Interaction", "GSAP", "Canvas", "Web APIs", "Animation"],
   [
      "Working style",
      "Systems thinking",
      "Prototyping",
      "Editorial UI",
      "Careful details",
   ],
];

export default function AboutPage() {
   return (
      <PageReveal>
         <section className="about-page page-frame">
            <div className="section-kicker">
               <span>04 / 04</span>
               <span>ABOUT / THE PERSON BEHIND IT</span>
            </div>
            <div className="about-heading">
               <span className="eyebrow">MAVOS / ABOUT</span>
               <h1>
                  Building interfaces
                  <br />
                  with <em>intent.</em>
               </h1>
               <p>
                  I’m a frontend and creative developer interested in the space
                  where engineering becomes an interaction. I make focused
                  digital experiences with React, browser APIs, and motion that
                  earns its place.
               </p>
            </div>
            <div className="about-rule" />
            <div className="skills-grid">
               {skills.map(([category, ...items]) => (
                  <div className="skills-column" key={category}>
                     <span className="eyebrow">{category}</span>
                     <ul>
                        {items.map((item) => (
                           <li key={item}>{item}</li>
                        ))}
                     </ul>
                  </div>
               ))}
            </div>
            <div className="about-contact">
               <div>
                  <span className="eyebrow">OPEN CHANNEL</span>
                  <h2>
                     Have something
                     <br />
                     <em>worth making?</em>
                  </h2>
               </div>
               <div className="contact-links">
                  <Link href="/experience">
                     Try MAVOS <span>↗</span>
                  </Link>
                  <Link href="/projects">
                     See selected work <span>↗</span>
                  </Link>
               </div>
            </div>
         </section>
      </PageReveal>
   );
}
