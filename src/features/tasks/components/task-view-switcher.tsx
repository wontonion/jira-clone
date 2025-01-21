"use client"
import { DottedSeparator } from "@/components/dotted-seperator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsTrigger, TabsList } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { Loader2, PlusIcon } from "lucide-react";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetTasks } from "../api/use-get-tasks";
import { useQueryState } from "nuqs";
import { DataFilters } from "./data-filters";
import { useTaskFilters } from "../hooks/use-task-filters";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { DataKanban } from "./data-kanban";
import { useCallback } from "react";
import { useBulkUpdateTask } from "../api/use-bulk-update-task";
import { DataCalendar } from "./data-calendar";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { TaskStatus } from "@prisma/client";
import { PopulatedTask } from "../types";

interface TaskViewSwitcherProps {
  hideProjectFilter?: boolean
}
export const TaskViewSwitcher = ({ hideProjectFilter }: TaskViewSwitcherProps) => {
  const [{
    status,
    assigneeId,
    projectId,
    dueDate,
  }] = useTaskFilters()
  const [view, setView] = useQueryState("task-view", {
    defaultValue: "table"
  })
  const workspaceId = useWorkspaceId()
  const paramProjectId = useProjectId()
  const { open } = useCreateTaskModal()
  
  const { mutate } = useBulkUpdateTask()
  const {
    data: tasksResponse,
    isLoading: isTasksLoading,
  } = useGetTasks({
    workspaceId,
    projectId: paramProjectId ?? projectId,
    assigneeId,
    status,
    dueDate,
  })
  
  const onKanbanChange = useCallback((
    tasks: { id: string; status: TaskStatus;  position: number}[]
  ) => {
    mutate({
      json: {
        tasks
      }
    })
  }, [mutate])


  return (
    <Tabs
      value={view}
      onValueChange={setView}
      className="flex-1 w-full border rounded-lg"
    >
      <div className="h-full flex flex-col overflow-auto p-4">
        <div className="flex flex-col gap-y-2 lg:flex-row justify-between items-center">
          <TabsList className="w-full lg:w-auto">
                      <TabsTrigger
                          className="h-8 w-full lg:w-auto"
                          value="table">
                          Table
                      </TabsTrigger>
                      <TabsTrigger
                          className="h-8 w-full lg:w-auto"
                          value="kanban">
                          Kanban
                      </TabsTrigger>
                      <TabsTrigger
                          className="h-8 w-full lg:w-auto"
                          value="calendar">
                          Calendar
                      </TabsTrigger>
          </TabsList>
          <Button
            size="sm"
            className="w-full lg:w-auto"
            onClick={open}
          >
            <PlusIcon className="size-4 mr-2" />
            Add Task
          </Button>
        </div>
        <DottedSeparator className="my-4" />
         <DataFilters hideProjectFilter={hideProjectFilter} />
        <DottedSeparator className="my-4" />
        {isTasksLoading ? (
          <div className="w-full border rounded-lg h-[200px] flex flex-col items-center justify-center">
            <Loader2 className="size-4 animate-spin" />
          </div>
        ): (
          
          <div>
            <TabsContent value="table" className="mt-0">
           <DataTable columns={columns} data={tasksResponse as PopulatedTask[] ?? []} />
          
          </TabsContent>
          <TabsContent value="kanban" className="mt-0">
                <DataKanban
                  data={tasksResponse as PopulatedTask[] ?? []}
                  onChange={onKanbanChange}
                  />
          
          </TabsContent>
          <TabsContent value="calendar" className="mt-0">
          < DataCalendar data={tasksResponse as PopulatedTask[] ?? []} />
          </TabsContent>
          </div>
        )}
      </div>
    </Tabs>
  );
};
