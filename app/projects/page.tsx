import { projects } from '@/data/projects';
import { ProjectGrid } from '@/components/projects/ProjectGrid';
import { PageReveal } from '@/components/ui/PageReveal';

export default function ProjectsPage() {
  return <PageReveal><section className="projects-page page-frame"><div className="section-kicker"><span>02 / 04</span><span>SELECTED WORK / 2023—24</span></div><div className="projects-heading"><div><span className="eyebrow">MAVOS / PROJECT INDEX</span><h1>Things made<br /><em>to be used.</em></h1></div><p>Interfaces, experiments, and systems that make interaction feel less like a layer and more like a material.</p></div><ProjectGrid projects={projects} /></section></PageReveal>;
}
