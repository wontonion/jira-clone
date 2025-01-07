import { DragDropContext } from "@hello-pangea/dnd";
import { Task, TaskStatus } from "../types";
import { useState } from "react";
import { KanbanColumnHeader } from "./kanban-column-header";
const boards: TaskStatus[] = [
    TaskStatus.BACKLOG,
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.IN_REVIEW,
    TaskStatus.DONE
]

type TaskState = {
    [key in TaskStatus]: Task[]
}

interface DataKanbanProps {
    data: Task[]
}


export const DataKanban = ({
    data
}: DataKanbanProps) => { 
    const [tasks, setTasks] = useState<TaskState>(() => {
        const initialTasks: TaskState = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.DONE]: []
        }

        data.forEach((task) => {
            initialTasks[task.status].push(task)
        })

        Object.keys(initialTasks).forEach((status) => {
            initialTasks[status as TaskStatus].sort((a, b) => a.position - b.position)
        }) 

        return initialTasks
        
    })



    return (
        <DragDropContext onDragEnd={()=>{}}>
            <div className="flex overflow-x-auto">
                {boards.map((board) => {
                    return (
                        <div key={board} className="flex-1 mx-2 bg-muted rounded-md min-w-[200px]">
                            <KanbanColumnHeader
                                board={board}
                                tasksCount={tasks[board].length}
                            />
                        </div>
                    )
                })}
            </div>

        </DragDropContext>
    )
}