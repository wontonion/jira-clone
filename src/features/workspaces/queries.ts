import { getMember } from "../members/utils";
import { prisma } from "@/lib/prisma-db";
import { getCurrent } from "../auth/queries";


export const getWorkspaces = async () => {

  const user = await getCurrent();

  if (!user) throw new Error("Get workspaces: User not found");
  const members = await prisma.member.findMany({
    where: {
      userId: user.id
    }
  });
  if (!members) throw new Error("Get workspaces: Members not found");

  const workspaceIds = members.map((member) => member.workspaceId);

  const workspaces = await prisma.workspace.findMany({
    where: {
      id: {
        in: workspaceIds
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return workspaces;
};

interface GetWorkspaceProps {
  workspaceId: string;
}

export const getWorkspace = async ({ workspaceId }: GetWorkspaceProps) => {
  const user = await getCurrent();
  if (!user) throw new Error("Get workspace: User not found");

  const member = await getMember({
    userId: user.id,
    workspaceId,
  });
  if (!member) throw new Error("Get workspace: Member not found");

  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId
    }
  });
  if (!workspace) throw new Error("Get workspace: Workspace not found");

  return workspace;
};

interface GetWorkspaceInfoProps {
  workspaceId: string;
}

export const getWorkspaceInfo = async ({
  workspaceId,
}: GetWorkspaceInfoProps) => {
  const workspace = await getWorkspace({
    workspaceId,
  });
  if (!workspace) throw new Error("Get workspace info: Workspace not found");
  return {
    name: workspace.name,
  };
};
