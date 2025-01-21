"use client"

import { DottedSeparator } from "@/components/dotted-seperator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id"
import { ArrowLeftIcon, MoreHorizontalIcon } from "lucide-react"
import Link from "next/link"
import { useGetMembers } from "../api/use-get-members"
import { Fragment } from "react"
import { MemberAvatar } from "./member-avatar"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export const MembersList = () => {
    const workspaceId = useWorkspaceId()
    const { data } = useGetMembers({ workspaceId })


    return (
        <Card className="w-full h-full border-none shadow-none">
            <CardHeader className="flex flex-row items-center gap-x-4 space-y-0">
                <Button asChild variant="secondary" size="sm">
                    <Link href={`/workspaces/${workspaceId}`}>
                        <ArrowLeftIcon className="size-4 mr-2" />
                        Back
                    </Link>
                </Button>
                <CardTitle className="text-xl font-bold">
                    Members List
                </CardTitle>
            </CardHeader>
            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent className="p-7">
                {data?.map((member, index) => (
                    <Fragment key={member.id}>
                        <div className="flex items-center gap-2">
                            <MemberAvatar
                                className="size-10"
                                fallbackClassName="text-lg"
                                name={member.name || ""} />
                        <div className="flex flex-col">
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                            </div>
                            
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="secondary" size="icon" className="ml-auto">
                                        <MoreHorizontalIcon className="size-4 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side="bottom" align="end">
                                    <DropdownMenuItem
                                        className="font-medium"
                                        
                                    >
                                        
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        {index < data.length - 1 && (
                            <Separator className="my-4" />
                        )}
                    </Fragment>
                ))}
            </CardContent>
        </Card>
    )
}