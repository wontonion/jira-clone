import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGetMembers } from "@/features/members/api/use-get-members"
import { useGetProjects } from "@/features/projects/api/use-get-projects"
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id"
import { Building2Icon, ListFilterIcon, UserIcon } from "lucide-react"
import { TaskStatus } from "@prisma/client"
import { useTaskFilters } from "../hooks/use-task-filters"
import { DatePicker } from "@/components/date-picker"

interface DataFiltersProps{
    hideProjectFilter?: boolean
}

export const DataFilters = ({ hideProjectFilter }: DataFiltersProps) => {

    const workspaceId  = useWorkspaceId()
    const {
        data: projects,
        isLoading: isProjectsLoading
    } = useGetProjects({ workspaceId })
    
    const {
        data: members,
        isLoading: isMembersLoading
    } = useGetMembers({ workspaceId })

    const isLoading = isProjectsLoading || isMembersLoading


    const projectOptions = projects?.map((project) => {
        return {
            value: project.id,
            label: project.name,
        }
    })

    const memberOptions = members?.map((member) => {
        return {
            value: member.id,
            label: member.name,
        }
    })

    const [{
        // status,
        // assigneeId,
        // projectId,
        dueDate,
    }, setFilters] = useTaskFilters()

    const onStatusChange = (value: string) => {
        setFilters({status: value === "all" ? null : value as TaskStatus})
    }
    const onAssigneeChange = (value: string) => {
        setFilters({assigneeId: value === "all" ? null : value})
    }
    const onProjectChange = (value: string) => {
        setFilters({projectId: value === "all" ? null : value})
    }

    if (isLoading) return null

    return (
        <div className="flex flex-col lg:flex-row gap-2">
            <Select
                defaultValue={undefined}
                onValueChange={(value) => onStatusChange(value)}
            >
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <div className="flex items-center pr-2">
                        <ListFilterIcon className="size-4 mr-2" />   
                        <SelectValue placeholder="All statuses" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectSeparator />
                    <SelectItem value={TaskStatus.BACKLOG}>Backlog</SelectItem>
                    <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                    <SelectItem value={TaskStatus.IN_REVIEW}>In Review</SelectItem>
                    <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
                    <SelectItem value={TaskStatus.TODO}>Todo</SelectItem>
                </SelectContent>
            </Select>
            <Select
                defaultValue={undefined}
                onValueChange={(value) => onAssigneeChange(value)}
            >
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <div className="flex items-center pr-2">
                        <UserIcon className="size-4 mr-2" />   
                        <SelectValue placeholder="All assignees" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All assignees</SelectItem>
                    <SelectSeparator />
                    {memberOptions?.map((member) => (
                        <SelectItem key={member.value} value={member.value}>
                            {member.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {!hideProjectFilter && (
            <Select
                defaultValue={undefined}
                onValueChange={(value) => onProjectChange(value)}
            >
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <div className="flex items-center pr-2">
                        <Building2Icon className="size-4 mr-2" />   
                        <SelectValue placeholder="All projects" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All projects</SelectItem>
                    <SelectSeparator />
                    {projectOptions?.map((project) => (
                        <SelectItem key={project.value} value={project.value}>
                            {project.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            )}
            <DatePicker
                placeholder="Due date"
                className="h-8 w-full lg:w-auto text-black"
                value={dueDate ? new Date(dueDate) : undefined}
                onChange={(value) => setFilters({dueDate: value ? value.toISOString() : null})}
            />
        </div>
    )

}
