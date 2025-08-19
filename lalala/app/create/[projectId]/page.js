// app/create/[projectId]/page.js

import {ProjectLayout} from "@/components/project-layout"

export default async function ProjectPage({ params }) {
  const { projectId } = await params
  console.log(projectId)
  return <ProjectLayout projectId={projectId} />
}
