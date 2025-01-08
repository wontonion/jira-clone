import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";
import { Task, TaskStatus } from "../types";
import { useCallback, useEffect, useState } from "react";
import { KanbanColumnHeader } from "./kanban-column-header";
import { KanbanCard } from "./kanban-card";
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
    onChange: (updates: { $id: string; status: TaskStatus; position: number }[]) => void
}


export const DataKanban = ({
    data,
    onChange
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

    useEffect(() => {
        const newTasks: TaskState = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.DONE]: []
        }

        data.forEach((task) => {
            newTasks[task.status].push(task)
        })

        Object.keys(newTasks).forEach((status) => {
            newTasks[status as TaskStatus].sort((a, b) => a.position - b.position)
        }) 

        setTasks(newTasks)
    }, [data])

    const onDragEnd = useCallback((result: DropResult) => {
        if (!result.destination) return 

        const { destination, source } = result
        const sourceStatus = source.droppableId as TaskStatus
        const destStatus = destination.droppableId as TaskStatus

        let updatesPayload: { $id: string; status: TaskStatus; position: number }[] = []
        
        setTasks((prevTasks) => {
            const newTasks = { ...prevTasks }
            
            // safely remove task from source status 
            const sourceColumn = [...newTasks[sourceStatus]]
            const [movedTask] = sourceColumn.splice(source.index, 1)

            /// if there is no moved task
            // return the previous state
            if (!movedTask) {
                console.error("No task found to move")
                return prevTasks
            }

            // create a new task object with potential updated status
            const updatedMovedTask = sourceStatus !== destStatus
                ? { ...movedTask, status: destStatus }
                : movedTask
            
            // update the position of the moved task
            newTasks[sourceStatus] = sourceColumn

            // add the task to dest status
            const destColumn = [...newTasks[destStatus]]
            destColumn.splice(destination.index, 0, updatedMovedTask)
            newTasks[destStatus] = destColumn

            // prepare minmal update payload 
            updatesPayload = []

            // always update the moved task
            updatesPayload.push({
                $id: updatedMovedTask.$id,
                status: destStatus,
                position: Math.min((destination.index + 1) * 1000, 1_000_000)
            })

            // update the position of the task in the destination col
            newTasks[destStatus].forEach((task, index) => {
                if (task && task.$id !== updatedMovedTask.$id) {
                    const newPosition = Math.min((index + 1) * 1000, 1_000_000)
                    if (task.position !== newPosition) {
                        updatesPayload.push({
                            $id: task.$id,
                            status: destStatus,
                            position: newPosition
                        })
                    }
                }
            })
            

            return newTasks

        })
        
        onChange(updatesPayload)
    }, [onChange])



    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex overflow-x-auto">
                {boards.map((board) => {
                    return (
                        <div key={board} className="flex-1 mx-2 bg-muted rounded-md min-w-[200px]">
                            <KanbanColumnHeader
                                board={board}
                                tasksCount={tasks[board].length}
                            />
                            <Droppable droppableId={board}>
                                {(provided) => {
                                    return (
                                    <div
                                    {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="min-h-[200px] py-1.5"
                                    >
                                        {tasks[board].map((task, index) => (
                                            <Draggable
                                                key={task.$id}
                                                draggableId={task.$id}
                                                index={index}
                                            >
                                                {(provided) => {
                                                    return (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                    >
                                                        <KanbanCard task={task} />

                                                        </div>
                                                    )
                                                }}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                        </div>
                                    )
                                }}
                            </Droppable>
                        </div>
                    )
                })}
            </div>

        </DragDropContext>
    )
}