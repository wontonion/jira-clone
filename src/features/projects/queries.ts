import { Query } from "node-appwrite"
import { MEMBERS_ID, PROJECTS_ID, WORKSPACES_ID } from "@/config"
import { DATABASE_ID } from "@/config"
import { Project } from "./types"
import { getMember } from "../members/utils"
import { createSessionClient } from "@/lib/appwrite"

interface GetWorkspaceProps {
    workspaceId: string;
}

export const getWorkspace = async ({workspaceId}: GetWorkspaceProps) => {
    try {
        const { account, databases } = await createSessionClient()

        const user = await account.get()

        const member = await getMember({
            databases,
            userId: user.$id,
            workspaceId
        })
        if (!member) return null

        const workspace = await databases.getDocument<Project>(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId
        )
         
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
        const { databases } = await createSessionClient()

        const workspace = await databases.getDocument<Project>(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId
        )
         
        return {
            name: workspace.name,
        }
    } catch {
        return null
    }
}