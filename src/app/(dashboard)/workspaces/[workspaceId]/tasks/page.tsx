import { getCurrent } from "@/features/auth/queries"
import { TaskViewSwitcher } from "@/features/tasks/components/task-view-switcher"
import { redirect } from "next/navigation"

const TasksPage = async () => {
    const user = await getCurrent()
    if (!user) redirect("/sign-in")
    

    return (
        <TaskViewSwitcher />
    )

}

export default TasksPage