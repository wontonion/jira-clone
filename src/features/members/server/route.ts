import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getMember } from "../utils";
import { MemberRole } from "@prisma/client";
import { jwtMiddleware } from "@/lib/jwt-middleware";
import { getCurrent } from "@/features/auth/queries";
import { prisma } from "@/lib/prisma-db";

const app = new Hono()
    .get(
        "/",
        jwtMiddleware,
        zValidator("query", z.object({ workspaceId: z.string() })),
        async (c) => {
            const user = await getCurrent(c)
            if (!user) {
                return c.json({error: "Getting members failed: User not found"}, 401)
            }
            const { workspaceId } = c.req.valid("query")

            const member = await getMember({
                workspaceId,
                userId: user.id
            })
            
            if (!member) {
                return c.json({error : "Getting members failed: Member not found"}, 401)
            }
            
            const members = await prisma.member.findMany({
                where: {
                    workspaceId
                },
                include: {
                    user: true
                }
            })  

            const populatedMembers = await Promise.all(
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
            
            return c.json({
                data: populatedMembers
            })
        }
)
    .delete(
        "/:memberId",
        jwtMiddleware,
        async (c) => {
            const { memberId } = c.req.param()
            const user = c.get("user")

            const memberToDelete = await prisma.member.findUnique({
                where: {
                    id: memberId
                }
            })

            if (!memberToDelete) {
                return c.json({error: "Deleting member failed: Member not found"}, 401)
            }

            const allMembersInWorkspace = await prisma.member.findMany({
                where: {
                    workspaceId: memberToDelete?.workspaceId
                }
            })

            const member = await getMember({
                workspaceId: memberToDelete?.workspaceId,
                userId: user.id
            })

            if (!member) {
                return c.json({error: "Deleting member failed: Member not found"}, 401)
            }
            
            if (member.role !== MemberRole.ADMIN && member.id !== memberToDelete.id) {
                return c.json({ error: "Unauthorized" }, 401)
            }
            
            if (allMembersInWorkspace.length === 1) {
                return c.json({error: "Cannot delete last member"}, 400)
            }

            await prisma.member.delete({
                where: {
                    id: memberId
                }
            })

            return c.json({data: "Member deleted successfully"})
        }
)
    .patch(
        "/:memberId",
        jwtMiddleware,
        zValidator("json", z.object({ role: z.nativeEnum(MemberRole) })),
        async (c) => {
            const { memberId } = c.req.param()
            const { role } = c.req.valid("json")
            const user = c.get("user")

            const memberToUpdate = await prisma.member.findUnique({
                where: {
                    id: memberId
                }
            })

            if (!memberToUpdate) {
                return c.json({error: "Updating member failed: Member not found"}, 401)
            }

            const allMembersInWorkspace = await prisma.member.findMany({
                where: {
                    workspaceId: memberToUpdate?.workspaceId
                }
            })

            const member = await getMember({
                workspaceId: memberToUpdate?.workspaceId,
                userId: user.id
            })

            if (!member) {
                return c.json({error: "Updating member failed: Member not found"}, 401)
            }
            
            if (member.role !== MemberRole.ADMIN && member.id !== memberToUpdate.id) {
                return c.json({ error: "Unauthorized" }, 401)
            }
            
            if (allMembersInWorkspace.length === 1) {
                return c.json({error: "Cannot downgrade the only admin member"}, 400)
            }

            await prisma.member.update({
                where: {
                    id: memberId
                },
                data: {
                    role
                }
            })

            return c.json({ data: { id: memberId, $role: role }, message: "Member updated successfully"})
        }
)

export default app