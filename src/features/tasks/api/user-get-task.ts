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

            return response.json()
        }
    })

    return query
}