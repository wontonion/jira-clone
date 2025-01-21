import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { ChevronRightIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { useDeleteTask } from "@/features/tasks/api/use-delete-task";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Project } from "@prisma/client";
import { Task } from "@prisma/client";

interface TaskBreadcrumbProps {
    project: Project
    task: Task;
}

export const TaskBreadcrumb = ({ project, task }: TaskBreadcrumbProps) => {
    const workspaceId = useWorkspaceId()
    const { mutate: deleteTask, isPending: isDeletingTask } = useDeleteTask()
    const router = useRouter()

    const [ConfirmDialog, confirm] = useConfirm(
        "Delete Task",
        "Are you sure you want to delete this task?",
        "destructive"
    )

    const handleDeleteTask = async () => {
        const ok = await confirm()
        if (!ok) return

        deleteTask({
            param: {
                taskId: task.id
            }
        }, {
            onSuccess: () => {
                toast.success("Task deleted successfully")
                router.push(`/workspaces/${workspaceId}/tasks`)
            }
        })
    }

    
    return (
        <div className="flex items-center gap-x-2">
            <ConfirmDialog />
            <ProjectAvatar 
                name={project.name}
                image={project.imageUrl ?? undefined}
                className="size-6 lg:size-8"
            />

            <Link href={`/workspaces/${workspaceId}/projects/${project.id}`} >
                <p className="text-sm lg:text-lg font-semibold text-muted-foreground hover:opacity-75 transition">
                    {project.name}
                </p>
            </Link>
            <ChevronRightIcon className="size-4 lg:size-5 text-muted-foreground" />
            <p className="text-sm lg:text-lg font-semibold ">
                {task.name}
            </p>
            <Button
                className="ml-auto"
                variant="destructive"
                size="sm"
                onClick={handleDeleteTask}
                disabled={isDeletingTask}
            >
                <TrashIcon className="size-4 lg:mr-2"/>
                <span className="hidden lg:block">Delete Task</span>
            </Button>

        </div>
    )
}