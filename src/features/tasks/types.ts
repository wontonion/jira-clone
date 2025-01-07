import { Models } from "node-appwrite";
import { Project } from "../projects/types";

export enum TaskStatus {
    BACKLOG = "BACKLOG",
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    IN_REVIEW = "IN_REVIEW",
    DONE = "DONE",
}

export type Task = Models.Document & {
    workspaceId: string;
    projectId: string;
    assigneeId: string;
    name: string;
    status: TaskStatus;
    position: number;
    dueDate: string;
}

export interface PopulatedTask extends Task {
  project: Project;
  assignee: {
    name: string;
    email: string;
    $id: string;
    $collectionId: string;
    $databaseId: string;
    $createdAt: string;
    $updatedAt: string;
    $permissions: string[];
  };
}
