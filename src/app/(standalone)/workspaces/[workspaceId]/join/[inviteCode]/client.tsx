"use client"

import { PageError } from "@/components/page-error"
import { PageLoader } from "@/components/page-loader"
import { useGetWorkspaceInfo } from "@/features/workspaces/api/use-get-workspace-info"
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id"

const WorkspaceIdJoinClient = () => {
    const  workspaceId  = useWorkspaceId()
    const { data, isLoading } = useGetWorkspaceInfo({ workspaceId })

    if (isLoading) return <PageLoader />
    if (!data) return <PageError message="Workspace not found" />


    return <div>
        <h1>Join Workspace</h1>
    </div>
}

export default WorkspaceIdJoinClient