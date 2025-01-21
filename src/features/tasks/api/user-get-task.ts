import { client } from "@/lib/rpc"
import { useQuery } from "@tanstack/react-query"

interface UserGetTaskProps {
    taskId: string
}

export const useGetTask = ({taskId}: UserGetTaskProps) => {
    const query = useQuery({
        queryKey: ["task", taskId],
        queryFn: async () => {
            const response = await client.api.tasks[":taskId"].$get({
                param: {
                    taskId,
                }
            })
            
            if (!response.ok) {
                throw new Error("Failed to fetch task")
            }

            const { data } = await response.json()
            const formattedData = {
                ...data,
                    createdAt: new Date(data.createdAt),
                    updatedAt: new Date(data.updatedAt),
                    dueDate: new Date(data.dueDate),
                    project: {
                        ...data.project,
                        createdAt: new Date(data.project.createdAt),
                        updatedAt: new Date(data.project.updatedAt),
                    },
                    assignee: {
                        ...data.assignee,
                        createdAt: new Date(data.assignee.createdAt),
                        updatedAt: new Date(data.assignee.updatedAt),
                        user: {
                            ...data.assignee.user,
                            createdAt: new Date(data.assignee.user.createdAt),
                            updatedAt: new Date(data.assignee.user.updatedAt),
                        }
                    }
            }

            return formattedData
        }
    })

    return query
}