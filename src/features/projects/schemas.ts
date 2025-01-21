import { z } from "zod"

export const createProjectSchema = z.object({
    name: z.string().trim().min(1, "Required"),
    image: z.union([
        // z.instanceof(File),
        z.custom<File>((value) => {
            // 只在客户端验证 File 对象
            if (typeof window === "undefined") return true;
            if (!(value instanceof File)) return false;
            return value.size <= 1024 * 1024; 
        }, "Must be a File under 1MB"),
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
            if (!(value instanceof File)) return false;
            return value.size <= 1024 * 1024; 
        }, "Must be a File under 1MB"),
        z.string().transform((value) => value === "" ? undefined: value)
    ]).optional(),
})