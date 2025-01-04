"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle, Link } from "lucide-react"

const ErrorPage = () => {
    return (
        <div className="h-screen flex flex-col items-center justify-center gap-y-4">
            <AlertTriangle />
            <p className="text-sm text-muted-foreground">
                Something went wrong
            </p>

            <Button variant="secondary">
                <Link href="/">
                    Back to Home
                </Link>
            </Button>
        </div>
    )
}

export default ErrorPage