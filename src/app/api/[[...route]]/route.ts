import { Hono } from "hono";
import { handle } from "hono/vercel"

const app = new Hono().basePath("/api")

app.get("/hello", (c) => {
    return c.json({hello: "world"})
})

app.get("/project/:projectId", (c) => {
    // when only extract one paramater, I can use below
    // const  projectId  = c.req.param("projectId")
    const { projectId } = c.req.param()
    return c.json({project: projectId})
})

// export for Vercel
export const GET = handle(app)