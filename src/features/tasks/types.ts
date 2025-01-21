import { Member, Project, Task, User } from "@prisma/client";

// export enum TaskStatus {
//     BACKLOG = "BACKLOG",
//     TODO = "TODO",
//     IN_PROGRESS = "IN_PROGRESS",
//     IN_REVIEW = "IN_REVIEW",
//     DONE = "DONE",
// }

// export type Task = PrismaTask2

export interface PopulatedTask extends Task {
  project: Project;
  assignee: PopulatedMember;
}

export interface PopulatedMember extends Member {
  user: User;
}
