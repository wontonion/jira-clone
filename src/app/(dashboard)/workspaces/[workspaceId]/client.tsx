"use client"

import { AnalyticsArea } from "@/components/analytics-area"
import { PageError } from "@/components/page-error"
import { PageLoader } from "@/components/page-loader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DottedSeparator } from "@/components/ui/dotted-seperator"
import { useGetMembers } from "@/features/members/api/use-get-members"
import { MemberAvatar } from "@/features/members/components/member-avatar"
import { Member } from "@/features/members/types"
import { useGetProjects } from "@/features/projects/api/use-get-projects"
import { ProjectAvatar } from "@/features/projects/components/project-avatar"
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal"
import { Project } from "@/features/projects/types"
import { useGetTasks } from "@/features/tasks/api/use-get-tasks"
import { useCreateTaskModal } from "@/features/tasks/hooks/use-create-task-modal"
import { Task } from "@/features/tasks/types"
import { useGetWorkspaceAnalytics } from "@/features/workspaces/api/use-get-workspace-analytics"
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id"
import { formatDistanceToNow } from "date-fns"
import { CalendarIcon, PlusIcon, SettingsIcon } from "lucide-react"
import Link from "next/link"

export const WorkspaceIdClient = () => {
    const  workspaceId  = useWorkspaceId()

    const { data: analytics, isLoading: isLoadingAnalytics } = useGetWorkspaceAnalytics({ workspaceId })
    const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({ workspaceId })
    const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId })
    const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId })

    const isLoading = isLoadingAnalytics || isLoadingTasks || isLoadingProjects || isLoadingMembers

    if (isLoading) { return <PageLoader /> }
    if (!analytics || !tasks || !projects || !members) { return <PageError message="Failed to fetch workspace data" /> }



    return (
        <div className="h-full flex flex-col space-y-4">
            <AnalyticsArea data={analytics} />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <TaskList data={tasks.documents} total={tasks.documents.length} />
                <ProjectList data={projects.documents} total={projects.documents.length} />
                <MemberList data={members.documents} total={members.documents.length} />
            </div>
        </div>
    )
}

interface TaskListProps {
    data: Task[]
    total: number
}

const TaskList = ({ data, total }: TaskListProps) => {
    const workspaceId = useWorkspaceId()
    const { open: createTaskModal } = useCreateTaskModal()
    
    return(
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">
                        Tasks ({total})
                    </p>
                    <Button 
                        variant="muted"
                        size={"icon"}
                        onClick={createTaskModal}
                    >
                        <PlusIcon className="size-4 text-neutral-400" />
                    </Button>
                </div>
                <DottedSeparator className="my-4" />
                <ul className="flex flex-col gap-y-4">
                    {
                        data.map((task) => (
                            <li key={task.id}>
                                <Link href={`/workspaces/${workspaceId}/tasks/${task.id}`}>
                                    <Card className="shadow-none rounded-lg hover:opactity-75 transition">
                                        <CardContent className="p-4">
                                            <p className="test-lg font-medium truncate">{task.name}</p>
                                            <div className="flex items-center gap-x-2">
                                                <p>{ task.project?.name}</p>
                                                <div className="size-1 rounded-full bg-neutral-400"></div>
                                                <div className="text-sm text-muted-foreground flex items-center">
                                                    <CalendarIcon className="size-3 mr-1" />
                                                    <span className="truncate">
                                                        {formatDistanceToNow(new Date(task.dueDate))}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </li>
                        ))}
                    <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
                        No tasks found
                    </li>
                </ul>
                <Button 
                    variant="muted"
                    className="mt-4 w-full"
                    asChild
                >
                    <Link href={`/workspaces/${workspaceId}/tasks`}>
                        Show All
                    </Link>
                </Button>
            </div>
        </div>
    )
}

interface ProjectListProps {
    data: Project[]
    total: number
}

const ProjectList = ({ data, total }: ProjectListProps) => {
    const workspaceId = useWorkspaceId()
    const { open: createProjectModal } = useCreateProjectModal()

    return(
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">
                        Projects ({total})
                    </p>
                    <Button 
                        variant="secondary"
                        size={"icon"}
                        onClick={createProjectModal}
                    >
                        <PlusIcon className="size-4 text-neutral-400" />
                    </Button>
                </div>
                <DottedSeparator className="my-4" />
                <ul className="flex flex-col gap-y-4">
                    {
                        data.map((project) => (
                            <li key={project.id}>
                                <Link href={`/workspaces/${workspaceId}/projects/${project.id}`}>
                                    <Card className="shadow-none rounded-lg hover:opactity-75 transition">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-x-2">
                                                <ProjectAvatar
                                                    className="size-12"
                                                    fallbackClassName="text-lg"
                                                    name={project.name}
                                                    image={project.imageUrl}
                                                />
                                                <p className="text-lg font-medium truncate">{ project.name}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </li>
                        ))}
                    <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
                        No tasks found
                    </li>
                </ul>
            </div>
        </div>
    )
}

interface MemberListProps {
    data: Member[]
    total: number
}

const MemberList = ({ data, total }: MemberListProps) => {
    const workspaceId = useWorkspaceId()

    return(
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">
                        Members ({total})
                    </p>
                    <Button 
                        variant="muted"
                        size={"icon"}
                        asChild
                    >
                        <Link href={`/workspaces/${workspaceId}/members`}>
                            <SettingsIcon className="size-4 text-neutral-400" />
                        </Link>
                    </Button>
                </div>
                <DottedSeparator className="my-4" />
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {
                        data.map((member) => (
                            <li key={member.id}>
                                    <Card className="shadow-none rounded-lg hover:opactity-75 transition">
                                    <CardContent className="p-4 flex flex-col items-center gap-x-2">
                                        <MemberAvatar 
                                            className="size-12"
                                            name={member.name}
                                        />
                                        <p className="text-lg font-medium truncate">
                                            {member.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {member.email}
                                        </p>
                                        </CardContent>
                                    </Card>
                            </li>
                        ))}
                    <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
                        No members found
                    </li>
                </ul>
            </div>
        </div>
    )
}