import { createSessionClient } from "@/lib/appwrite"
import { prisma } from "@/lib/prisma-db"
import { Prisma } from "@prisma/client"
import { randomUUID } from "crypto"
import { Session, SessionData, Store } from "hono-sessions"

export type PrismaSessionData = Session<{
    user: {
        id: string;
        email: string;
        name: string;
    }
}>

export class PrismaSessionStore implements Store {
    async getSessionById(sessionId?: string): Promise<SessionData | null | undefined> {
        const session = await prisma.session.findUnique({
            where: {
                sid: sessionId
            }
        })
        if (!session) return null
        if (session.expiresAt < new Date()) {
            await prisma.session.delete({
                where: {
                    sid: sessionId
                }
            })
            return null
        }
        return session.data ? JSON.parse(session.data) : null
    }
    async createSession(sessionId: string, initialData: SessionData): Promise<void> {
        const expiresAt = new Date(Date.now() + 60 * 60 * 24 * 7 * 1000)
        try {
            await prisma.session.create({
                data: {
                    sid: sessionId,
                    data: JSON.stringify(initialData),
                    expiresAt
                }
            })
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                // If session already exists (unique constraint violation)
                await this.persistSessionData(sessionId, initialData)
            } else {
                throw error
            }
        }
    }
    async persistSessionData(sessionId: string, sessionData: SessionData): Promise<void> {
        const expiresAt = new Date(Date.now() + 60 * 60 * 24 * 7 * 1000)
        await prisma.session.update({
            where: {
                sid: sessionId
            },
            data: {
                data: JSON.stringify(sessionData),
                expiresAt
            }
        })
    }
    async deleteSession(sessionId: string): Promise<void> {
        await prisma.session.delete({
            where: {
                sid: sessionId
            }
        })
    }
}


// create session in database using prisma
// export const createSession = async({ userId, userName, userEmail }: { userId: string, userName: string, userEmail: string }) => {
//     const sid = randomUUID()
    
//     // check if session already exists
//     const existingSession = await prisma.session.findUnique({
//         where: {
//             sid
//         }
//     })
//     // if session exists, update it
//     if (existingSession) {
//         await prisma.session.update({
//             where: {
//                 id: existingSession.id
//             },
//             data: {
//                 data: JSON.stringify({ userId, userName, userEmail }),
//                 expiresAt: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000)
//             }
//         })
//     }
//     // if there is no session, create a new one
//     await prisma.session.create({
//         data: {
//             sid,
//             data: JSON.stringify({ userId, userName, userEmail }),
//             expiresAt: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000)
//         }
//     })

//     return sid
// }




export const getCurrent = async () => {
    try {
        const { account } = await createSessionClient()
        
        return await account.get()
    } catch {
        return null
    }
}