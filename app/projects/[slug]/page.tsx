import { notFound } from 'next/navigation';
import { getProject, projects } from '@/data/projects';
import { ProjectDetail } from '@/components/projects/ProjectDetail';

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = getProject(params.slug);
  if (!project) notFound();
  return <ProjectDetail project={project} />;
}
