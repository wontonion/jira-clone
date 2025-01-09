import { PencilIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task } from "../types";
import { DottedSeparator } from "@/components/ui/dotted-seperator";
import { useState } from "react";
import { useUpdateTask } from "../api/use-update-task";
import { Textarea } from "@/components/ui/textarea";

interface TaskDescriptionProps {
    task: Task;
}

export const TaskDescription = ({
    task
}: TaskDescriptionProps) => {
    
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(task.description);

    const { mutate: updateTask, isPending: isUpdatingTask } = useUpdateTask();

    const handleSave = () => {
        updateTask({
            json: {
                description: value
            },
            param: {                              
                taskId: task.$id
            }
        });
    }

    return (
        <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">
                    Description
                </p>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsEditing((prev) => !prev)}
                >
                    {isEditing ? (
                        <XIcon className="size-4 mr-2" />
                    ): (
                        <PencilIcon className="size-4 mr-2" />
                    )}
                    {isEditing ? "Cancel" : "Edit"}
                </Button>
            </div>
            <DottedSeparator className="my-4" />
            {isEditing ? (
                <div className="flex flex-col gap-y-4">
                    <Textarea
                        placeholder="Add a description..."
                        value={value}
                        rows={4}
                        onChange={(e) => setValue(e.target.value)}
                        disabled={isUpdatingTask}
                    />
                    <Button 
                      size="sm"
                      onClick={handleSave}
                      disabled={isUpdatingTask}
                    >
                        {isUpdatingTask ? "Saving..." : "Save"}
                    </Button>
                </div>
            ) : (
                    
            <div>
                <div>
                    {task.description || (
                        <span className="text-muted-foreground">
                            No description
                        </span>
                    )}
                    </div>
                </div>
            )}
        </div>
    )
}