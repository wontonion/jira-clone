"use client"

import { useGetProjects } from "@/features/projects/api/use-get-projects"
import { ProjectAvatar } from "@/features/projects/components/project-avatar"
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal"
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { RiAddCircleFill } from "react-icons/ri"

export const Projects = () => {
    const pathname = usePathname()
    const { open } = useCreateProjectModal()    
    const workspaceId = useWorkspaceId()
    const { data, isPending } = useGetProjects({ workspaceId })

    return (
        <div className="flex flex-col gap-y-2">
            <div className="flex items-center justify-between">
                <p className="text-xs uppercase text-neutral-500">
                    Projects
                </p>
                <RiAddCircleFill onClick={open} className="size-5 text-neutral-500"/>
            </div>

            {isPending && (
                <div className="flex items-center justify-center">
                    <Loader2 className="size-4 animate-spin text-neutral-500"/>
                </div>
            )}

            {data?.map((project) => {
                const href = `/workspaces/${workspaceId}/projects/${project.id}`

                const isActive = pathname === href
                return (
                    <Link href={href} key={project.id}>
                        <div
                            className={(cn(
                                "flex items-center gap-2.5 p-2.5 rounded-md hover:opacity-75 transition cursor-pointer text-neutral-500",
                                isActive && "bg-neutral-100 shadow-sm hover:opacity-100 text-primary"
                            ))}
                        >
                            <ProjectAvatar image={project.imageUrl ?? undefined} name={project.name} />
                            <span className="truncate">{project.name}</span>
                        </div>
                    </Link>
                )
                
            })}
        </div>
    )
}