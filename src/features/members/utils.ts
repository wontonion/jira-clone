import { prisma } from "@/lib/prisma-db"
    
interface GetMemberProps {
    workspaceId: string
    userId: string
}

export const getMember = async ({
    workspaceId,
    userId
}: GetMemberProps) => {
    const member = await prisma.member.findFirst({
        where: {
            workspaceId,
            userId
        }
    })
    return member
}