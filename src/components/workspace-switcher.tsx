"use client"

import { RiAddCircleFill } from "react-icons/ri"
import { useWorkspaces } from "@/features/workspaces/api/use-get-workspaces"
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "./ui/select"
import { WorkspaceAvatar } from "@/features/workspaces/components/workspace-avatar"
import { useRouter } from "next/navigation"

export const WorkspaceSwitcher = () => { 
    const router = useRouter()
    const { data: workspaces } = useWorkspaces()
    
    const onSelect = (workspaceId: string) => {
        router.push(`/workspaces/${workspaceId}`)
    }

    return (
        <div className="flex flex-col gap-y-2">
            <div className="flex items-center justify-between">
                <p className="text-xs uppercase text-neutral-500">Workspaces</p>
                <RiAddCircleFill className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition" />
            </div>
            <Select onValueChange={onSelect}>
                <SelectTrigger className="w-full bg-neutral-200 font-medium p-1">
                    <SelectValue placeholder="No workspaces selected" />
                </SelectTrigger>
                <SelectContent>
                    {workspaces?.documents.map((workspace) => (
                        <SelectItem key={workspace.$id} value={workspace.$id}>
                            <div className="flex justify-start items-center gap-3 font-medium">
                                <WorkspaceAvatar name={workspace.name} image={workspace.image} />
                                <span className="truncate">{workspace.name}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
    </div>
    )
}