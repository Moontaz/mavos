import Link from "next/link";
import { HomeHero } from "@/components/home/HomeHero";
import { PageReveal } from "@/components/ui/PageReveal";

export default function HomePage() {
   return (
      <PageReveal>
         <HomeHero />
         <section className="home-statement page-frame">
            <div className="section-kicker">
               <span>THE PREMISE</span>
               <span>01 — 03</span>
            </div>
            <div className="statement-grid">
               <p className="statement-large">
                  The web has always been something you point at.{" "}
                  <em>MAVOS asks what happens when it listens.</em>
               </p>
               <div className="statement-side">
                  <p>
                     Speak naturally. Move through a portfolio. See how a voice
                     becomes a cursor, a route, a command.
                  </p>
                  <Link className="text-button" href="/about">
                     Read the thinking <span>↗</span>
                  </Link>
               </div>
            </div>
         </section>
         <section className="home-index page-frame">
            <div className="section-kicker">
               <span>EXPLORE THE SYSTEM</span>
               <span>03 / 04</span>
            </div>
            <div className="index-links">
               <Link href="/experience">
                  <span>01</span>
                  <strong>Voice experience</strong>
                  <small>Talk to the interface ↗</small>
               </Link>
               <Link href="/projects">
                  <span>02</span>
                  <strong>Selected projects</strong>
                  <small>Work in motion ↗</small>
               </Link>
               <Link href="/about">
                  <span>03</span>
                  <strong>About / contact</strong>
                  <small>The person behind it ↗</small>
               </Link>
            </div>
         </section>
         <footer className="site-footer page-frame">
            <span>MAVOS — MY VOICE</span>
            <span>DESIGNED / BUILT IN THE BROWSER</span>
            <span>2026 ↗</span>
         </footer>
      </PageReveal>
   );
}
