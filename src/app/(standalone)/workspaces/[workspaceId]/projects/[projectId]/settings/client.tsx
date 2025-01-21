"use client"

import { EditProjectForm } from "@/features/projects/components/edit-project-form";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";

const ProjectIdSettingsClient = () => {
  const projectId = useProjectId()
  const { data, isLoading } = useGetProject({ projectId })
  
  if (isLoading) return <PageLoader />
  if (!data) return <PageError message="Project not found" />

  const formattedData = {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  }

  return (
    <div className="w-full lg:max-w-2xl">
      <EditProjectForm initialValues={formattedData} />
    </div>
  );
};

export default ProjectIdSettingsClient;