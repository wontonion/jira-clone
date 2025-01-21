import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../schemas";
import { generateInviteCode } from "@/lib/utils";
import { getMember } from "@/features/members/utils";
import { z } from "zod";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { MemberRole, TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma-db";
import { jwtMiddleware } from "@/lib/jwt-middleware";

const app = new Hono()
    // get workspaces
    .get("/",
        jwtMiddleware,
        async (c) => {
            const user = c.get("user")
            
            const members = await prisma.member.findMany({
                where: {
                    userId: user.id
                }
            })
            if (members.length === 0) {
                return c.json({ data: [] })
            }
            const workspaceIds = members.map(
                (member) => member.workspaceId
            )
            const workspaces = await prisma.workspace.findMany({
                where: {
                    id: {
                        in: workspaceIds
                    }
                },
                include: {
                    members: true,
                    projects: true,
                },
                orderBy: {
                    createdAt: "desc"
                }
            })


            return c.json({ data: workspaces })
        })
    // get single workspace
    .get(
        "/:workspaceId",
        jwtMiddleware,
        async (c) => {
            const user = c.get("user")
            const { workspaceId } = c.req.param()
            

            const member = await getMember({
                workspaceId,
                userId: user.id
            })

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401)
            }


            const workspace = await prisma.workspace.findUnique({
                where: {
                    id: workspaceId
                },
                include: {
                    members: true,
                    projects: true,
                }
            })

            return c.json({ data: workspace })
        }
)
    //get workspace info
    .get(
        "/:workspaceId/info",
        jwtMiddleware,
        async (c) => {
            // const user = c.get("user")
            const { workspaceId } = c.req.param()

            const workspace = await prisma.workspace.findUnique({
                where: {
                    id: workspaceId
                },
                include: {
                    members: true,
                    projects: true,
                }
            })

            if (!workspace) {
                return c.json({ error: "Workspace not found" }, 404)
            }

            return c.json({
                data: {
                    id: workspace.id,
                    name: workspace.name,
                    imageUrl: workspace.imageUrl,
                }
            })
        }
    )
    // create workspace
    .post(
        "/",
        zValidator("form", createWorkspaceSchema),
        jwtMiddleware,
        async (c) => {
            const user = c.get("user")

            const { name, image } = c.req.valid("form")

            let uploadedImageUrl: string | undefined
            
            console.log('Received image:', image)
            console.log('Image type:', typeof image)
            console.log('Image constructor:', image?.constructor?.name)
            // console.log('Is File?', image instanceof File)
            console.log('Image properties:', Object.getOwnPropertyNames(image))
            if (image && typeof image === 'object' && 'name' in image && 'size' in image) {
            // if (image instanceof File) { 
                const arrayBuffer = await image.arrayBuffer()
                const buffer = Buffer.from(arrayBuffer)
                uploadedImageUrl = `data:${image.type};base64,${buffer.toString('base64')}`
            }

            // create workspace
            const workspace = await prisma.workspace.create({
                data: {
                    name,
                    userId: user.id,
                    imageUrl: uploadedImageUrl,
                    inviteCode: generateInviteCode(10)
                }
            })
            // create according member
            await prisma.member.create({
                data: {
                    userId: user.id,
                    workspaceId: workspace.id,
                    role: MemberRole.ADMIN
                }
            })

            return c.json({ data: workspace})
        })
// update workspace
    .patch(
        "/:workspaceId",
        jwtMiddleware,
        zValidator("form", updateWorkspaceSchema),
        async (c) => { 
                const user = c.get("user")

                const { workspaceId } = c.req.param()
                const { name, image } = c.req.valid("form")
                
            const member = await getMember({
                workspaceId,
                userId: user.id
            })

            if (!member || member.role !== MemberRole.ADMIN) {
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
            
            // 2. make up new workspace
            const workspace = await prisma.workspace.update({
                where: {
                    id: workspaceId
                },
                data: {
                    name,
                    imageUrl: uploadedImageUrl
                }
            })

            return c.json({ data: workspace })
        })
// delete workspace
    .delete(
        "/:workspaceId",
        jwtMiddleware,
        async (c) => {
            const user = c.get("user")
            const { workspaceId } = c.req.param()

            const member = await getMember({
                workspaceId,
                userId: user.id
            })

            if (!member || member.role !== MemberRole.ADMIN) {
                return c.json({ error: "Unauthorized" }, 401)
            }
            
            // TODO : delete members projects and tasks
            
            await prisma.workspace.delete({
                where: {
                    id: workspaceId
                }
            })

            return c.json({ data: { id: workspaceId } })
        }
)
// reset invite code
    .post(
        "/:workspaceId/reset-invite-code",
        jwtMiddleware,
        async (c) => {
            const user = c.get("user")
            const { workspaceId } = c.req.param()

            const member = await getMember({
                workspaceId,
                userId: user.id
            })

            if (!member || member.role !== MemberRole.ADMIN) {
                return c.json({ error: "Unauthorized" }, 401)
            }
            
           const workspace = await prisma.workspace.update({
                where: {
                    id: workspaceId
                },
                data: {
                    inviteCode: generateInviteCode(10)
                }
            })

            return c.json({ data: workspace })
        }
)
// join workspace
    .post(
        "/:workspaceId/join",
        jwtMiddleware,
        zValidator("json", z.object({code: z.string()})),
        async (c) => {
            const { workspaceId } = c.req.param()
            const { code } = c.req.valid("json")

            const user = c.get("user")

            const member = await getMember({
                workspaceId,
                userId: user.id
            })

            if (member) {
                return c.json({ error: "Already a member" }, 400)
            }

            const workspace = await prisma.workspace.findUnique({
                where: {
                    id: workspaceId
                },
                include: {
                    members: true,
                    projects: true,
                }
            })

            if (!workspace) {
                return c.json({ error: "Workspace not found" }, 404)
            }

            if (workspace.inviteCode !== code) {
                return c.json({ error: "Invalid invite code" }, 400)
            }

            await prisma.member.create({
                data: {
                    workspaceId,
                    userId: user.id,
                    role: MemberRole.MEMBER
                }
            })
            

            return c.json({ data: workspace })
        }
    )
    // get project analytics
 // get project analytics
 .get(
    "/:workspaceId/analytics",
    jwtMiddleware,
    async (c) => {
        const user = c.get("user")
        const { workspaceId } = c.req.param()

        const member = await getMember({
            workspaceId,
            userId: user.id
        })

        if (!member) {
            return c.json({ error: "Unauthorized" }, 401)
        }

        const now = new Date()
        const thisMonthStart = startOfMonth(now)
        const thisMonthEnd = endOfMonth(now)
        const lastMonthStart = startOfMonth(subMonths(now, 1))
        const lastMonthEnd = endOfMonth(subMonths(now, 1))
        
        // tasks total analytics
        const thisMonthTasks = await prisma.task.findMany({
            where: {
                workspaceId,
                createdAt: {
                    gte: thisMonthStart,
                    lte: thisMonthEnd
                }
            }
        })

        const lastMonthTasks = await prisma.task.findMany({
            where: {
                workspaceId,
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
                workspaceId,
                assigneeId: user.id,
                createdAt: {
                    gte: thisMonthStart,
                    lte: thisMonthEnd
                }
            }
        })

        const lastMonthAssignedTasks = await prisma.task.findMany({
            where: {
                workspaceId,
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
                workspaceId,
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
                workspaceId,
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
                workspaceId,
                status: TaskStatus.DONE,
                createdAt: {
                    gte: thisMonthStart,
                    lte: thisMonthEnd
                }
            }
        })

        const lastMonthCompletedTasks = await prisma.task.findMany({
            where: {
                workspaceId,
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
                workspaceId,
                status: {
                    not: TaskStatus.DONE
                },
                dueDate: {
                    lt: now
                }
            }
        })

        const lastMonthOverdueTasks = await prisma.task.findMany({
            where: {
                workspaceId,
                status: {
                    not: TaskStatus.DONE
                },
                dueDate: {
                    lt: now
                }
            }
        })

        const overdueTaskCount = thisMonthOverdueTasks.length
        const overdueTaskDifference = overdueTaskCount - lastMonthOverdueTasks.length

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
export default app