import { getCurrent } from "@/features/auth/queries"
import { JoinWorkspaceForm } from "@/features/workspaces/components/join-workspace-form";
import { getWorkspaceInfo } from "@/features/workspaces/queries"
import { redirect } from "next/navigation"

interface WorkspaceJoinPageProps {
    params: {
        workspaceId: string;
        inviteCode: string;
    }
}

const WorkspaceJoinPage = async ({
    params
}: WorkspaceJoinPageProps) => {
    const user = await getCurrent()
    if (!user) {
        redirect("/sign-in")
    }

    const initialValues = await getWorkspaceInfo({ workspaceId: params.workspaceId })

    if (!initialValues) {
        redirect("/")
    }
    
    
    return (
        <div>
            <JoinWorkspaceForm initialValues={initialValues} />
        </div>
    )
}

export default WorkspaceJoinPage