import { ProjectLayout } from "@/components/project-layout"

export default function ProjectPage({ params }) {
  return <ProjectLayout projectId={params.projectId} />
}
