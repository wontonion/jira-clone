import { client } from "@/lib/rpc"
import { useQuery } from "@tanstack/react-query"
import { TaskStatus } from "@prisma/client"


interface UseGetTasksProps {
    workspaceId: string
    projectId?: string | null
    status?: TaskStatus | null
    assigneeId?: string | null
    dueDate?: string | null
    search?: string | null
}

export type TasksResponse = Awaited<ReturnType<typeof useGetTasks>>["data"]

export const useGetTasks = ({
    workspaceId,
    projectId,
    assigneeId,
    status,
    dueDate,
    search
}: UseGetTasksProps) => {
    const query = useQuery({
        queryKey: ["tasks",
            workspaceId,
            projectId,
            assigneeId,
            status,
            dueDate,
            search
        ],
        queryFn: async () => {
            const response = await client.api.tasks.$get({
                query: {
                    workspaceId,
                    projectId: projectId ?? [],
                    assigneeId: assigneeId ?? [],
                    status: status ?? [],
                    dueDate: dueDate ?? [],
                    search: search ?? []
                }
            })

            if (!response.ok) {
                throw new Error("Failed to fetch tasks")
            }

            const { data } = await response.json()

            
            const formattedData = data.map((task) => ({
                ...task,
                createdAt: new Date(task.createdAt),
                updatedAt: new Date(task.updatedAt),
                dueDate: new Date(task.dueDate),
                project: {
                    ...task.project,
                    createdAt: new Date(task.project!.createdAt),
                    updatedAt: new Date(task.project!.updatedAt),
                },
                assignee: {
                    ...task.assignee,
                    createdAt: new Date(task.assignee!.createdAt),
                    updatedAt: new Date(task.assignee!.updatedAt),
                }
            }))
            return formattedData
        }
    })
    return query
}