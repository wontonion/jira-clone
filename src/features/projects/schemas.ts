import { z } from "zod"

export const createProjectSchema = z.object({
    name: z.string().trim().min(1, "Required"),
    image: z.union([
        // z.instanceof(File),
        z.custom<File>((value) => {
            // 只在客户端验证 File 对象
            if (typeof window === "undefined") return true;
            return value instanceof File;
        }, "Must be a File"),
        z.string().transform((value) => value === "" ? undefined: value)
    ]).optional(),
    workspaceId: z.string(),
})

export const updateProjectSchema = z.object({
    name: z.string().trim().min(1, "Must be at least 1 character").optional(),
    image: z.union([
        // z.instanceof(File),
        z.custom<File>((value) => {
            // 只在客户端验证 File 对象
            if (typeof window === "undefined") return true;
            return value instanceof File;
        }, "Must be a File"),
        z.string().transform((value) => value === "" ? undefined: value)
    ]).optional(),
})