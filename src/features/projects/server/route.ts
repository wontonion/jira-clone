import { getMember } from "@/features/members/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { createProjectSchema, updateProjectSchema } from "../schemas";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { TaskStatus } from "@prisma/client";
import { jwtMiddleware } from "@/lib/jwt-middleware";
import { prisma } from "@/lib/prisma-db";

const app = new Hono()
    // get projects
    .get(
        "/",
        jwtMiddleware,
        zValidator("query", z.object({
            workspaceId: z.string().min(1, "Workspace ID is required")
        })),
        async (c) => {
            const user = c.get("user")
            
            const { workspaceId } = c.req.valid("query")

            const member = await getMember({
                workspaceId,
                userId: user.id
            })

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            const projects = await prisma.project.findMany({
                where: {
                    workspaceId,
                },
                include: {
                    tasks: true
                },
                orderBy: {
                    createdAt: "asc"
                }
            })

            return c.json({ data: projects })
        }
        
)
    // get single project
    .get(
        "/:projectId",
        jwtMiddleware,
        async (c) => {
            const user = c.get("user")
            const { projectId } = c.req.param()

            const project = await prisma.project.findUnique({
                where: {
                    id: projectId
                },
                include: {
                    tasks: true
                }
            })

            if (!project) {
                return c.json({ error: "Getting project failed: Project not found" }, 404)
            }

            const member = await getMember({
                workspaceId: project.workspaceId,
                userId: user.id
            })

            if (!member) {
                return c.json({ error: "Getting project failed: Unauthorized" }, 401)
            }

            return c.json({ data: project })
        }
    )
    // get project analytics
    .get(
        "/:projectId/analytics",
        jwtMiddleware,
        async (c) => {
            const user = c.get("user")
            const { projectId } = c.req.param()

            const project = await prisma.project.findUnique({
                where: {
                    id: projectId
                }
            })

            if (!project) {
                return c.json({ error: "Getting project analytics failed: Project not found" }, 404)
            }

            const member = await getMember({
                workspaceId: project.workspaceId,
                userId: user.id
            })

            if (!member) {
                return c.json({ error: "Getting project analytics failed: Unauthorized" }, 401)
            }

            const now = new Date()
            const thisMonthStart = startOfMonth(now)
            const thisMonthEnd = endOfMonth(now)
            const lastMonthStart = startOfMonth(subMonths(now, 1))
            const lastMonthEnd = endOfMonth(subMonths(now, 1))
            
            // tasks total analytics
            const thisMonthTasks = await prisma.task.findMany({
                where: {
                    projectId,
                    createdAt: {
                        gte: thisMonthStart,
                        lte: thisMonthEnd
                    }
                }
            })


            const lastMonthTasks = await prisma.task.findMany({
                where: {
                    projectId,
                    createdAt: {
                        gte: lastMonthStart,
                        lte: lastMonthEnd
                    }
                }
            })

            const taskCount = thisMonthTasks.length 
            const taskDifference = taskCount - lastMonthTasks.length

            // tasks assigned analytics
            const thisMonthAssignedTasks = await prisma.task.findMany({
                where: {
                    projectId,
                    assigneeId: user.id,
                    createdAt: {
                        gte: thisMonthStart,
                        lte: thisMonthEnd
                    }
                }
            })

            const lastMonthAssignedTasks = await prisma.task.findMany({
                where: {
                    projectId,
                    assigneeId: user.id,
                    createdAt: {
                        gte: lastMonthStart,
                        lte: lastMonthEnd
                    }
                }
            })

            const assignedTaskCount = thisMonthAssignedTasks.length
            const assignedTaskDifference = assignedTaskCount - lastMonthAssignedTasks.length

            // incomplete tasks analytics
            const thisMonthIncompleteTasks = await prisma.task.findMany({
                where: {
                    projectId,
                    status: {
                        not: TaskStatus.DONE
                    },
                    createdAt: {
                        gte: thisMonthStart,
                        lte: thisMonthEnd
                    }
                }
            })

            const lastMonthIncompleteTasks = await prisma.task.findMany({
                where: {
                    projectId,
                    status: {
                        not: TaskStatus.DONE
                    },
                    createdAt: {
                        gte: lastMonthStart,
                        lte: lastMonthEnd
                    }
                }
            })

            const incompleteTaskCount = thisMonthIncompleteTasks.length
            const incompleteTaskDifference = incompleteTaskCount - lastMonthIncompleteTasks.length

            // completed tasks analytics
            const thisMonthCompletedTasks = await prisma.task.findMany({
                where: {
                    projectId,
                    status: TaskStatus.DONE,
                    createdAt: {
                        gte: thisMonthStart,
                        lte: thisMonthEnd
                    }
                }
            })

            const lastMonthCompletedTasks = await prisma.task.findMany({
                where: {
                    projectId,
                    status: TaskStatus.DONE,
                    createdAt: {
                        gte: lastMonthStart,
                        lte: lastMonthEnd
                    }
                }
            })

            const completedTaskCount = thisMonthCompletedTasks.length
            const completedTaskDifference = completedTaskCount - lastMonthCompletedTasks.length
            
            // overdue tasks analytics
            const thisMonthOverdueTasks = await prisma.task.findMany({
                where: {
                    projectId,
                    status: {
                        not: TaskStatus.DONE
                    },
                    dueDate: {
                        lt: now,
                        gte: thisMonthStart,
                        lte: thisMonthEnd
                    }
                }
            })

            const lastMonthOverdueTasks = await prisma.task.findMany({
                where: {
                    projectId,
                    status: {
                        not: TaskStatus.DONE
                    },
                    dueDate: {
                        lt: now,
                        gte: lastMonthStart,
                        lte: lastMonthEnd
                    }
                }
            })

            const overdueTaskCount = thisMonthOverdueTasks.length
            const overdueTaskDifference = overdueTaskCount - lastMonthOverdueTasks.length

            // console.log(thisMonthOverdueTasks)
            return c.json({
                data: {
                taskCount,
                taskDifference,
                assignedTaskCount,
                assignedTaskDifference,
                incompleteTaskCount,
                incompleteTaskDifference,
                completedTaskCount,
                completedTaskDifference,
                overdueTaskCount,
                overdueTaskDifference
            } })
        }
    )
    // create project
    .post(
    
    "/",
    jwtMiddleware,
    zValidator("form", createProjectSchema),
    async (c) => {
        const user = c.get("user")
        
        const { workspaceId, name, image } = c.req.valid("form")

        const member = await getMember({
            workspaceId,
            userId: user.id
        })

        if (!member) {
            return c.json({ error: "Unauthorized" }, 401)
        }

        // logic for updating workspace
        // 1. update image
        let uploadedImageUrl: string | undefined

        if (image && typeof image === 'object' && 'name' in image && 'size' in image) {
        // if (image instanceof File) { 
            const arrayBuffer = await image.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)
            uploadedImageUrl = `data:${image.type};base64,${buffer.toString('base64')}`

        }
        
        // 2. make up new workspace
        const project = await prisma.project.create({
            data: {
                name,
                imageUrl: uploadedImageUrl,
                workspaceId,
            }
        })

        return c.json({ data: project })

    }
)
// update project
.patch(
    "/:projectId",
    jwtMiddleware,
    zValidator("form", updateProjectSchema),
    async (c) => { 
        const user = c.get("user")
        
        const { projectId } = c.req.param()
        const { name, image } = c.req.valid("form")
        
        const existingProject = await prisma.project.findUnique({
            where: {
                id: projectId
            }
        })

        if (!existingProject) {
            return c.json({ error: "Project not found" }, 404)
        }

        const member = await getMember({
            workspaceId: existingProject.workspaceId,
            userId: user.id
        })

        if (!member) {
            return c.json({ error: "Unauthorized" }, 401)
        }

        // logic for updating project
        // 1. update image
        let uploadedImageUrl: string | undefined
        
        // if it is file, change it to base64
        if (image && typeof image === 'object' && 'name' in image && 'size' in image) {
            const arrayBuffer = await image.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)
            uploadedImageUrl = `data:${image.type};base64,${buffer.toString('base64')}`
        }
        
        // 2. make up new workspace
        const project = await prisma.project.update({
            where: {
                id: projectId
            },
            data: {
                name,
                imageUrl: uploadedImageUrl
            }
        })

        return c.json({ data: project })
    })
// delete project
.delete(
    "/:projectId",
    jwtMiddleware,
    async (c) => {
        const user = c.get("user")
        const { projectId } = c.req.param()

        const existingProject = await prisma.project.findUnique({
            where: {
                id: projectId
            }
        })

        if (!existingProject) {
            return c.json({ error: "Project not found" }, 404)
        }

        const member = await getMember({
            workspaceId: existingProject.workspaceId,
            userId: user.id
        })

        if (!member) {
            return c.json({ error: "Unauthorized" }, 401)
        }
        
        // TODO : delete tasks
        
        await prisma.project.delete({
            where: {
                id: projectId
            }
        })

        return c.json({ data: { id: existingProject.id } })
    }
)

export default app