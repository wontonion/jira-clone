"use client"

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { cn } from "@/lib/utils";
import { SettingsIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GoCheckCircle, GoCheckCircleFill, GoHome, GoHomeFill } from "react-icons/go";
const routes = [
    {
        label: "Home",
        href: "",
        icon: GoHome,
        activateIcon:GoHomeFill,
    },
    {
        label: "My Task",
        href: "/tasks",
        icon: GoCheckCircle,
        activateIcon:GoCheckCircleFill,
    },
    {
        label: "Setting",
        href: "/settings",
        icon: SettingsIcon,
        activateIcon:SettingsIcon,
    },
    {
        label: "Members",
        href: "/members",
        icon: UsersIcon,
        activateIcon:UsersIcon,
    },
]

export const Navigation = () => {
    const workspaceId = useWorkspaceId()
    const pathname = usePathname()


    return (
        <ul className="flex flex-col">
            {routes.map((item, index) => { 
                const fullHref = `/workspaces/${workspaceId}/${item.href}`
                const isActive = pathname === fullHref
                const Icon = isActive ? item.activateIcon : item.icon
                
                return (
                    <Link key={index} href={fullHref}>
                        <div className={cn(
                            "flex items-center gap-2.5 p-2.5 rounded-md font-medium hover:text-primary transition text-neutral-500",
                            isActive && "bg-white shadow-sm hover:opacity-100 text-primary"
                        )}>
                            <Icon className="size-5 text-neutral-500" />
                            {item.label}

                        </div>
                    </Link>
                )
            })}
            
        
        
        </ul>
    )
}