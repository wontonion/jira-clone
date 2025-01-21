"use client"

import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspace-form";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";

const WorkspaceIdSettingsClient = () => {
  const workspaceId = useWorkspaceId()
  const { data, isLoading } = useGetWorkspace({ workspaceId })
  
  if (isLoading) return <PageLoader />
  if (!data) return <PageError message="Workspace not found" />

  const formattedData = {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  }
  return (
    <div className="w-full lg:max-w-2xl">
      <EditWorkspaceForm initialValues={formattedData} />
    </div>
  );
};

export default WorkspaceIdSettingsClient;
