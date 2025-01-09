import { AlertTriangleIcon } from "lucide-react"

interface PageErrorProps {
    message?: string
}

export const PageError = ({ message }: PageErrorProps) => {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <AlertTriangleIcon className="size-6 text-muted-foreground mb-2" />
            <div className="text-2xl font-bold">{message || "An error occurred"}</div>
        </div>
    )
}