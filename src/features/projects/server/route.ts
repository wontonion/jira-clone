import { DATABASE_ID, IMAGES_BUCKET_ID, PROJECTS_ID, TASKS_ID } from "@/config";
import { getMember } from "@/features/members/utils";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { z } from "zod";
import { createProjectSchema, updateProjectSchema } from "../schemas";
import { Project } from "../types";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { TaskStatus } from "@/features/tasks/types";

const app = new Hono()
    // get projects
    .get(
        "/",
        sessionMiddleware,
        zValidator("query", z.object({
            workspaceId: z.string()
        })),
        async (c) => {
            const user = c.get("user")
            const databases = c.get("databases")
            
            const { workspaceId } = c.req.valid("query")
            if (!workspaceId) {
                return c.json({ error: "Workspace ID is required" }, 400)
            }

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            const projects = await databases.listDocuments<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.orderAsc("$createdAt")
                ]
            )

            return c.json({ data: projects })
        }
        
)
    // get single project
    .get(
        "/:projectId",
        sessionMiddleware,
        async (c) => {
            const user = c.get("user")
            const databases = c.get("databases")
            const { projectId } = c.req.param()

            const project = await databases.getDocument<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                projectId
            )

            const member = await getMember({
                databases,
                workspaceId: project.workspaceId,
                userId: user.$id
            })

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            return c.json({ data: project })
        }
    )
    // get project analytics
    .get(
        "/:projectId/analytics",
        sessionMiddleware,
        async (c) => {
            const user = c.get("user")
            const databases = c.get("databases")
            const { projectId } = c.req.param()

            const project = await databases.getDocument<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                projectId
            )

            const member = await getMember({
                databases,
                workspaceId: project.workspaceId,
                userId: user.$id
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
            const thisMonthTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.greaterThan("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
                ]
            )

            const lastMonthTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.greaterThan("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
                ]
            )

            const taskCount = thisMonthTasks.total 
            const taskDifference = taskCount - lastMonthTasks.total

            // tasks assigned analytics
            const thisMonthAssignedTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.equal("assigneeId", user.$id),
                    Query.greaterThan("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
                ]
            )

            const lastMonthAssignedTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.equal("assigneeId", user.$id),
                    Query.greaterThan("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
                ]
            )

            const assignedTaskCount = thisMonthAssignedTasks.total
            const assignedTaskDifference = assignedTaskCount - lastMonthAssignedTasks.total

            // incomplete tasks analytics
            const thisMonthIncompleteTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.greaterThan("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
                ]
            )

            const lastMonthIncompleteTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.greaterThan("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
                ]
            )

            const incompleteTaskCount = thisMonthIncompleteTasks.total
            const incompleteTaskDifference = incompleteTaskCount - lastMonthIncompleteTasks.total

            // completed tasks analytics
            const thisMonthCompletedTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.equal("status", TaskStatus.DONE),
                    Query.greaterThan("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
                ]
            )

            const lastMonthCompletedTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.equal("status", TaskStatus.DONE),
                    Query.greaterThan("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
                ]
            )
            
            const completedTaskCount = thisMonthCompletedTasks.total
            const completedTaskDifference = completedTaskCount - lastMonthCompletedTasks.total
            
            // overdue tasks analytics
            const thisMonthOverdueTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.lessThan("dueDate", now.toISOString()),
                    Query.greaterThan("dueDate", thisMonthStart.toISOString()),
                    Query.lessThanEqual("dueDate", thisMonthEnd.toISOString())
                ]
            )

            const lastMonthOverdueTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.lessThan("dueDate", now.toISOString()),
                    Query.greaterThan("dueDate", lastMonthStart.toISOString()),
                    Query.lessThanEqual("dueDate", lastMonthEnd.toISOString())
                ]
            )

            const overdueTaskCount = thisMonthOverdueTasks.total
            const overdueTaskDifference = overdueTaskCount - lastMonthOverdueTasks.total

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
    sessionMiddleware,
    zValidator("form", createProjectSchema),
    async (c) => {
        const databases = c.get("databases")
        const storage = c.get("storage")
        const user = c.get("user")
        
        const { workspaceId, name, image } = c.req.valid("form")

        const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id
        })

        if (!member) {
            return c.json({ error: "Unauthorized" }, 401)
        }

        // logic for updating workspace
        // 1. update image
        let uploadedImageUrl: string | undefined

        if (image && typeof image === 'object' && 'name' in image && 'size' in image) {
        // if (image instanceof File) { 
            const file = await storage.createFile(
                IMAGES_BUCKET_ID,
                ID.unique(),
                image,
            )
            
            const arrayBuffer = await storage.getFilePreview(
                IMAGES_BUCKET_ID,
                file.$id
            )
            
            uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`
        }
        
        // 2. make up new workspace
        const project = await databases.createDocument(
            DATABASE_ID,
            PROJECTS_ID,
            ID.unique(),
            {
                name,
                imageUrl: uploadedImageUrl,
                workspaceId,
            }
        )

        return c.json({ data: project })

    }
)
// update project
.patch(
    "/:projectId",
    sessionMiddleware,
    zValidator("form", updateProjectSchema),
    async (c) => { 
            const databases = c.get("databases")
            const storage = c.get("storage")
            const user = c.get("user")
            
            const { projectId } = c.req.param()
            const { name, image } = c.req.valid("form")
            
        const existingProject = await databases.getDocument<Project>(
            DATABASE_ID,
            PROJECTS_ID,
            projectId
        )

        if (!existingProject) {
            return c.json({ error: "Project not found" }, 404)
        }

        const member = await getMember({
            databases,
            workspaceId: existingProject.workspaceId,
            userId: user.$id
        })

        if (!member) {
            return c.json({ error: "Unauthorized" }, 401)
        }

        // logic for updating project
        // 1. update image
        let uploadedImageUrl: string | undefined

        if (image && typeof image === 'object' && 'name' in image && 'size' in image) {
        // if (image instanceof File) { 
            const file = await storage.createFile(
                IMAGES_BUCKET_ID,
                ID.unique(),
                image,
            )
            
            const arrayBuffer = await storage.getFilePreview(
                IMAGES_BUCKET_ID,
                file.$id
            )
            
            uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`
        }
        
        // 2. make up new workspace
        const project = await databases.updateDocument(
            DATABASE_ID,
            PROJECTS_ID,
            projectId,
            {
                name,
                imageUrl: uploadedImageUrl
            }
        )

        return c.json({ data: project })
    })
// delete project
.delete(
    "/:projectId",
    sessionMiddleware,
    async (c) => {
        const databases = c.get("databases")
        const user = c.get("user")
        const { projectId } = c.req.param()

        const existingProject = await databases.getDocument<Project>(
            DATABASE_ID,
            PROJECTS_ID,
            projectId
        )

        const member = await getMember({
            databases,
            workspaceId: existingProject.workspaceId,
            userId: user.$id
        })

        if (!member) {
            return c.json({ error: "Unauthorized" }, 401)
        }
        
        // TODO : delete tasks
        
        await databases.deleteDocument(DATABASE_ID, PROJECTS_ID, existingProject.$id)

        return c.json({ data: { $id: existingProject.$id } })
    }
)

export default app