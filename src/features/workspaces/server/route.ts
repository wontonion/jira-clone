import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../schemas";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { MemberRole } from "@/features/members/types";
import { generateInviteCode } from "@/lib/utils";
import { getMember } from "@/features/members/utils";

const app = new Hono()
    .get("/",
        sessionMiddleware,
        async (c) => {
            const user = c.get("user")
            const databases = c.get("databases")
            
            const members = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                [Query.equal("userId", user.$id)]
            )
            if (members.total === 0) {
                return c.json({ data: {documents: [], total: 0} })
            }
            const workspaceIds = members.documents.map(
                (member) => member.workspaceId
            )
            const workspaces = await databases.listDocuments(
                DATABASE_ID,
                WORKSPACES_ID,
                [
                    Query.contains("$id", workspaceIds),
                    Query.orderDesc("$createdAt")
                ]
            )


            return c.json({ data: workspaces })
        })
    .post(
        "/",
        zValidator("form", createWorkspaceSchema),
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases") // need to add database for sessionMiddleware?
            const storage = c.get("storage")
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
            // create workspace
            const workspace = await databases.createDocument(
                DATABASE_ID,
                WORKSPACES_ID,
                ID.unique(),
                {
                    name,
                    userId: user.$id,
                    imageUrl: uploadedImageUrl,
                    inviteCode: generateInviteCode()
                }
            )
            // create according member
            await databases.createDocument(
                DATABASE_ID,
                MEMBERS_ID,
                ID.unique(),
                {
                    userId: user.$id,
                    workspaceId: workspace.$id,
                    role: MemberRole.ADMIN
                }
            )

            return c.json({ data: workspace})
        })
    .patch(
        "/:workspaceId",
        sessionMiddleware,
        zValidator("form", updateWorkspaceSchema),
        async (c) => { 
                const databases = c.get("databases")
                const storage = c.get("storage")
                const user = c.get("user")
                
                const { workspaceId } = c.req.param()
                const { name, image } = c.req.valid("form")
                
            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })

            if (!member || member.role !== MemberRole.ADMIN) {
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
            const workspace = await databases.updateDocument(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId,
                {
                    name,
                    imageUrl: uploadedImageUrl
                }
            )

            return c.json({ data: workspace })
        })


export default app