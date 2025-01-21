import { getMember } from "../members/utils"
import { getCurrent } from "../auth/queries"
import { prisma } from "@/lib/prisma-db"

interface GetWorkspaceProps {
    workspaceId: string;
}

export const getWorkspace = async ({workspaceId}: GetWorkspaceProps) => {
    try {
        const user = await getCurrent()
        if (!user) return null

        const member = await getMember({
            userId: user.id,
            workspaceId
        })
        if (!member) return null

        const workspace = await prisma.project.findUnique({
            where: {
                id: workspaceId
            }
        })
         
        return workspace
    } catch {
        return null
    }
}

interface GetWorkspaceInfoProps {
    workspaceId: string;
}

export const getWorkspaceInfo = async ({workspaceId}: GetWorkspaceInfoProps) => {
    try {
        const user = await getCurrent()
        if (!user) return null

        const member = await getMember({
            userId: user.id,
            workspaceId
        })
        if (!member) return null

        const workspace = await prisma.project.findUnique({
            where: {
                id: workspaceId
            }
        })
        if (!workspace) return null
        return {
            name: workspace.name,
            imageUrl: workspace.imageUrl
        }
    } catch {
        return null
    }
}