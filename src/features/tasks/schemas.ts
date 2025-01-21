import { z } from "zod";
import { TaskStatus } from "@prisma/client";

export const createTaskSchema = z.object({
    name: z.string().min(1, "Required"),
    status: z.nativeEnum(TaskStatus, {required_error: "Required"}),
    workspaceId: z.string().trim().min(1, "Required"),
    projectId: z.string().trim().min(1, "Required"),
    assigneeId: z.string().trim().min(1, "Required"),
    dueDate: z.coerce.date(),
    description: z.string().optional(),
})

export type CreateTaskSchema = z.infer<typeof createTaskSchema>