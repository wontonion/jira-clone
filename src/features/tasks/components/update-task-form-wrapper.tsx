import { Card, CardContent } from "@/components/ui/card"
import { useGetMembers } from "@/features/members/api/use-get-members"
import { useGetProjects } from "@/features/projects/api/use-get-projects"
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id"
import { Loader2 } from "lucide-react"
import { UpdateTaskForm } from "./update-task-form"
import { useGetTask } from "../api/user-get-task"

interface UpdateTaskFormWrapperProps { 
    onCancel: () => void
    id: string
}

export const UpdateTaskFormWrapper = ({
    onCancel,
    id,
}: UpdateTaskFormWrapperProps) => {
    const workspaceId = useWorkspaceId()
    const { data: initialValues, isLoading: isLoadingTask } = useGetTask({ taskId: id })
    
    const {
        data: projects,
        isLoading: isLoadingProjects,
    } = useGetProjects({ workspaceId })
    
    
    const {
        data: members,
        isLoading: isLoadingMembers,
    } = useGetMembers({ workspaceId })
    
    if (!initialValues) return null
    if (!projects) return null
    if (!members) return null

    const projectOptions = projects.map((project) => ({
        id: project.id,
        name: project.name,
        imageUrl: project.imageUrl ?? "",
    }))

    const memberOptions = members.map((member) => ({
        id: member.id,    
        name: member.name ?? member.email ?? "",
    }))

    const isLoading = isLoadingProjects || isLoadingMembers || isLoadingTask

    if (isLoading) return (
        <Card className="w-full h-[714px] border-none shadow-none">
            <CardContent className="flex items-center justify-center h-full">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </CardContent>
        </Card>
    )

    if (!initialValues) return null
    return (
      <UpdateTaskForm
        onCancel={onCancel}
        projectOptions={projectOptions ?? []}
        memberOptions={memberOptions ?? []}
        initialValues={initialValues}
      />
    );
}