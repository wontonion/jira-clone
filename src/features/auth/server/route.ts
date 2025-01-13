import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { registerSchema, loginSchema } from "../schemas";
import { createAdminClient } from "@/lib/appwrite";
import { ID } from "node-appwrite";
import {deleteCookie, setCookie} from "hono/cookie"
import { AUTH_COOKIE } from "../constants";
import { sessionMiddleware } from "@/lib/session-middleware";
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma-db";
import { CookieStore, Session } from "hono-sessions";
import { sessionMiddleware as honoSessionMiddleware } from "hono-sessions";

const store = new CookieStore()
type SessionType = Session<{
  user: {
    id: string;
    email: string;
    name: string;
  }
}>

const app = new Hono<{
  Variables: {
    session: SessionType
  }
}>()
  .use(honoSessionMiddleware({
    store,
    encryptionKey: "password_at_least_32_characters_long",
    cookieOptions: {
      path: "/",
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 7,
    }
  }))
  .post(
  "/register",
  zValidator("json", registerSchema),
  async (c) => {
    const { name, email, password } = c.req.valid("json");

    // check if user exists
    const existingUser = await prisma.user.findUnique({
      where: {email}
    })

    if (existingUser) {
      return c.json({ error: 'User already exists' }, 400)
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // create new user
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword
      }
    })

    // get session from context 
    const session: SessionType = c.get("session")
    session.set("user", {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name
    })
    
    
    setCookie(c, AUTH_COOKIE, JSON.stringify(session), {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
    })
    
    return c.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
      });
  })
  .post(
    "/login",
    zValidator("json", loginSchema),
    async (c) => {
      const { email, password } = c.req.valid("json");
      
      const { account } = await createAdminClient();
      const session = await account.createEmailPasswordSession(email, password);
      // const user = await prisma.user.findUnique({
      //   where: {email}
      // })
      
      // if (!user) {
      //   return c.json({ error: 'Unauthorized: User not found' }, 401)
      // }
      
      // check password
      // const isPasswordValid = await bcrypt.compare(password, user.password)
      
      
      
      setCookie(c, AUTH_COOKIE, session.secret, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
      })
      return c.json({ success: true });
      
    }
  )
  .get("/current", 
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");

      return c.json({ data: user });
    }
  )
  .post("/logout", sessionMiddleware,async (c) => {
    const  account  = c.get("account");

    deleteCookie(c, AUTH_COOKIE);
    await account.deleteSession("current");

    return c.json({ success: true });
  })
  ;

export default app;
