"use client"

import { useGetTask } from "@/features/tasks/api/user-get-task"
import { useTaskId } from "@/features/tasks/hooks/use-task-id"
import { PageLoader } from "@/components/page-loader"
import { PageError } from "@/components/page-error"
import { TaskBreadcrumb } from "@/components/task-breadcrumbs"
import { DottedSeparator } from "@/components/ui/dotted-seperator"
import { TaskOverview } from "@/features/tasks/components/task-overview"
import { TaskDescription } from "@/features/tasks/components/task-description"

export const TaskIdClient = () => {
    const taskId = useTaskId()
    const { data, isLoading } = useGetTask({ taskId })

    if (isLoading) return <PageLoader />
    if (!data) return <PageError message="Task not found" />
    
    return (
        <div className="flex flex-col">
            <TaskBreadcrumb project={data.project} task={data} />
            <DottedSeparator className="my-6" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <TaskOverview task={data} />
                <TaskDescription task={data} />
            </div>
        </div>
    )
}