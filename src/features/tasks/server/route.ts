import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { createTaskSchema } from "../schemas"
import { getMember } from "@/features/members/utils"
import { z } from "zod"
import { TaskStatus } from "@prisma/client"
import { jwtMiddleware } from "@/lib/jwt-middleware"
import { prisma } from "@/lib/prisma-db"

const app = new Hono()
   .post(
      "/",
      jwtMiddleware,
      zValidator("json", createTaskSchema),
      async (c) => {
         const user = c.get("user")
         const {
            name,
            status,
            workspaceId,
            projectId,
            dueDate,
            assigneeId
         } = c.req.valid("json")

         const member = await getMember({
            workspaceId,
            userId: user.id
         })

         if (!member) {
            return c.json({ error: "Create task failed, member not found" }, 401)
         }

         const highestPositionTask = await prisma.task.findMany({
            where: {
               status,
               workspaceId,
               position: {
                  gt: 0
               },
            },
            orderBy: {
               position: "asc"
            },
            take: 1
         })

         const newPosition =
            highestPositionTask.length > 0
               ? highestPositionTask[0].position + 1
               : 1000

         const task = await prisma.task.create({
            data: {
               name,
               status,
               workspaceId,
               projectId,
               dueDate,
               assigneeId,
               position: newPosition
            }
         })

         return c.json({ data: task })
      }
   )
   .get(
      "/",
      jwtMiddleware,
      zValidator("query", z.object({
         workspaceId: z.string(),
         projectId: z.string().nullish(),
         status: z.nativeEnum(TaskStatus).optional(),
         assigneeId: z.string().nullish(),
         search: z.string().nullish(),
         dueDate: z.string().nullish(),
      })),
      async (c) => {
         const user = c.get("user")
         const { workspaceId, projectId, status, assigneeId, search, dueDate } = c.req.valid("query")

         const member = await getMember({
            workspaceId,
            userId: user.id
         })

         if (!member) {
            return c.json({ error: "Get tasks failed, member not found" }, 401)
         }

         const where = {
            workspaceId,
            ...(projectId && { projectId }),
            ...(assigneeId && { assigneeId }),
            ...(status && { status }),
            ...(dueDate && { dueDate }),
            ...(search && {
               name: {
                  contains: search,
               }
            })
         }

         const tasks = await prisma.task.findMany({
            where,
            orderBy: {
               createdAt: 'desc'
            }
         })

         const projectIds = tasks.map((task) => task.projectId).filter((id): id is string => id !== null)
         const assigneeIds = tasks.map((task) => task.assigneeId).filter((id): id is string => id !== null)

         const projects = await prisma.project.findMany({
            where: {
               id: {
                  in: projectIds
               }
            }
         })

         const members = await prisma.member.findMany({
            where: {
               id: {
                  in: assigneeIds
               }
            }
         })

         const assignees = await Promise.all(
            members.map(async (member) => {
               const user = await prisma.user.findUnique({
                  where: {
                     id: member.userId
                  }
               })
               return {
                  ...member,
                  name: user?.name || user?.email,
                  email: user?.email,
               }
            })
         )

         const populatedTasks = tasks.map((task) => {
            const project = projects.find((project) => project.id === task.projectId)
            const assignee = assignees.find((assignee) => assignee.id === task.assigneeId)
            return {
               ...task,
               project,
               assignee
            }
         })
         
         return c.json({
            data: populatedTasks
         })
      })
   .delete(
      "/:taskId",
      jwtMiddleware,
      async (c) => {
         const user = c.get("user")
         const { taskId } = c.req.param()
         
         const task = await prisma.task.findUnique({
            where: {
               id: taskId
            }
         })

         if (!task) {
            return c.json({ error: "Delete task failed, task not found" }, 404)
         }

         const member = await getMember({
            workspaceId: task.workspaceId,
            userId: user.id
         })

         if (!member) {
            return c.json({ error: "Delete task failed, member not found" }, 401)
         }

         await prisma.task.delete({
            where: {
               id: taskId
            }
         })

         return c.json({ data: { id: taskId } })


      }
   )
   .patch(
      "/:taskId",
      jwtMiddleware,
      zValidator("json", createTaskSchema.partial()),
      async (c) => { 
         const user = c.get("user")
         const {
            name,
            status,
            projectId,
            dueDate,
            assigneeId,
            description
         } = c.req.valid("json")

         const { taskId } = c.req.param()
         const existingTask = await prisma.task.findUnique({
            where: {
               id: taskId
            }
         })

         if (!existingTask) {
            return c.json({ error: "Update task failed, task not found" }, 404)
         }

         const member = await getMember({
            workspaceId: existingTask.workspaceId,
            userId: user.id
         })
         if (!member) {
            return c.json({ error: "Unauthorized" }, 401)
         }

         const task = await prisma.task.update({
            where: {
               id: taskId
            },
            data: {
               name,
               status,
               projectId,
               dueDate,
               assigneeId,
               description
            }
         })

         return c.json({ data: task })
      }
   )
   .get(
      "/:taskId",
      jwtMiddleware,
      async (c) => {
         const currentUser = c.get("user")
         const { taskId } = c.req.param()

         const task = await prisma.task.findUnique({
            where: {
               id: taskId
            }
         })

         if (!task) {
            return c.json({ error: "Get task failed, task not found" }, 404)
         }

         const member = await getMember({
            workspaceId: task.workspaceId,
            userId: currentUser.id
         })

         if (!member) {
            return c.json({ error: "Unauthorized" }, 401)
         }

         const project = await prisma.project.findUnique({
            where: {
               id: task.projectId
            }
         })

         if (!project) {
            return c.json({ error: "Get task failed, project not found" }, 404)
         }

         if (!task.assigneeId) {
            return c.json({ error: "Get task failed, assignee is not set" }, 404)
         }

         const assignee = await prisma.member.findUnique({
            where: {
               id: task.assigneeId
            }
         })

         if (!assignee) {
            return c.json({ error: "Get task failed, assignee not found" }, 404)
         }

         const user = await prisma.user.findUnique({
            where: {
               id: assignee.userId
            }
         })
         if (!user) {
            return c.json({ error: "Get task failed, user not found, assigneeId not found" }, 404)
         }

         const assigneeInfo = {
            ...assignee,
            user
         }

         return c.json({ data: { ...task, project, assignee: assigneeInfo } })
   })
   .post(
      "/bulk-update",
      jwtMiddleware,
      zValidator(
         "json",
         z.object({
            tasks: z.array(
               z.object({
                  id: z.string(),
                  status: z.nativeEnum(TaskStatus),
                  position: z.number().int().positive().min(1000).max(1_000_000)
               })
            )
         })
      ),
      async (c) => {
         const user = c.get("user")
         const { tasks } = await c.req.valid("json")

         const tasksToUpdate = await prisma.task.findMany({
            where: {
               id: {
                  in: tasks.map((task) => task.id)
               }
            }
         })

         const workspaceIds = new Set(tasksToUpdate.map((task) => task.workspaceId))

         if (workspaceIds.size !== 1) {
            return c.json({error: "All tasks must belong to the same workspace"}, 400)
         }

         const member = await getMember({
            workspaceId: workspaceIds.values().next().value as string,
            userId: user.id
         })

         if (!member) {
            return c.json({error: "Unauthorized"}, 401)
         }

         const updatedTasks = await Promise.all(
            tasks.map(async (task) => {
               const { id, status, position } = task;
               return prisma.task.update({
                  where: {
                     id
                  },
                  data: {
                     status,
                     position
                  }
               })
            })
         )

         return c.json({data: updatedTasks})
      }
   )

export default app
