import { DATABASE_ID, IMAGES_BUCKET_ID, PROJECTS_ID } from "@/config";
import { getMember } from "@/features/members/utils";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { z } from "zod";
import { createProjectSchema, updateProjectSchema } from "../schemas";
import { MemberRole } from "@/features/members/types";
import { Project } from "../types";

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

            const projects = await databases.listDocuments(
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