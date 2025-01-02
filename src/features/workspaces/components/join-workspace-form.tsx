"use client"
import { DottedSeparator } from "@/components/dotted-seperator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useJoinWorkspace } from "../api/use-join-workspce";
import { useInviteCode } from "../hooks/use-invite-code";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "../hooks/use-workspace-id";

interface JoinWorkspaceFormProps {
    initialValues: {
        name: string;
    }
}

export const JoinWorkspaceForm = ({
    initialValues
}: JoinWorkspaceFormProps) => {
    const router = useRouter()
    const workspaceId = useWorkspaceId()
    const inviteCode = useInviteCode()
    const { mutate, isPending } = useJoinWorkspace()

    const onSubmit = () => {
        mutate({
            param: { workspaceId },
            json: { code: inviteCode }
        }, {
            onSuccess: () => {
                router.push(`/workspaces/${workspaceId}`)
            }
        })
    }


    return (
        <Card className="w-full h-full border-none shadow-none">
            <CardHeader className="p-7">
                <CardTitle className="text-xl font-bold">
                    Join Workspace
                </CardTitle>
            <CardDescription >
                You have been invited to join <strong>{initialValues.name}</strong> workspace.
            </CardDescription>

            </CardHeader>
            <div className="px-7">
                <DottedSeparator className="py-7" />
            </div>
            <CardContent>
                <div className="flex flex-col gap-2 lg:flex-row items-center justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        asChild
                        size="lg"
                        className="w-full lg:w-fit"
                    >
                        <Link href="/">
                            Cancel
                        </Link>
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        size="lg"
                        className="w-full lg:w-fit"
                        onClick={onSubmit}
                        disabled={isPending}
                    >
                        Join Workspace
                    </Button>
                </div>
            </CardContent>
        </Card>

    )
}