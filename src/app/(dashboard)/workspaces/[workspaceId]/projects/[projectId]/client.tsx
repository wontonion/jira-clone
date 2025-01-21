"use client"

import { PageError } from "@/components/page-error"
import { PageLoader } from "@/components/page-loader"
import { ProjectAvatar } from "@/features/projects/components/project-avatar"
import { Button } from "@/components/ui/button"
import { useGetProject } from "@/features/projects/api/use-get-project"
import { useProjectId } from "@/features/projects/hooks/use-project-id"
import { TaskViewSwitcher } from "@/features/tasks/components/task-view-switcher"
import { PencilIcon } from "lucide-react"
import Link from "next/link"
import { useGetProjectAnalytics } from "@/features/projects/api/use-get-project-analytics"
import { AnalyticsArea } from "@/components/analytics-area"


export const ProjectIdClient = () => {
    const projectId = useProjectId()
    const { data: project, isLoading: isProjectLoading } = useGetProject({ projectId })
    const { data: analytics, isLoading: isAnalyticsLoading } = useGetProjectAnalytics({ projectId })

    const isLoading = isProjectLoading || isAnalyticsLoading

    if (isLoading) return <PageLoader/>

    if (!project) return <PageError message="Project not found" />

    return (
        <div className="flex flex-col gap-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                    <ProjectAvatar
                        image={project.imageUrl ?? undefined}
                        name={project.name}
                        className="size-10"
                    />
                    <p className="text-lg font-semibold">{ project.name }</p>
                </div>
                <div>
                    <Button variant="secondary" size="sm" asChild>
                        <Link href={`/workspaces/${project.workspaceId}/projects/${project.id}/settings`}>
                            <PencilIcon className="size-4 mr-2"/>
                            Edit Project
                        </Link>

                    </Button>
                </div>
            </div>
            {
                analytics && (
                    <AnalyticsArea data={analytics} />
                )
            }
            <TaskViewSwitcher hideProjectFilter={true} />
        </div>
    )
}