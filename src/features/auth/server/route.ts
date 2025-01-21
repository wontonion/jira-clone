import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { registerSchema, loginSchema } from "../schemas";
import {deleteCookie, setCookie} from "hono/cookie"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma-db";
import jwt from 'jsonwebtoken'
import { JWT_AUTH } from "../constants";
import { jwtMiddleware } from "@/lib/jwt-middleware";



const app = new Hono()
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
    
    const jwtToken = jwt.sign(
      {
        id: newUser.id,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24  // 1 day
      },
      process.env.JWT_SECRET!
    )

    console.log(process.env.JWT_SECRET)

    setCookie(c, JWT_AUTH, jwtToken)
    
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
      
      const user = await prisma.user.findUnique({
        where: {email}
      })

      if (!user) {
        return c.json({ error: 'User not found' }, 400)
      }

      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (!isPasswordValid) {
        return c.json({ error: 'Invalid password' }, 400)
      }

      const jwtToken = jwt.sign(
        {
          id: user.id,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24  // 1 day
        },
        process.env.JWT_SECRET!
      )
      
      setCookie(c, JWT_AUTH, jwtToken)
      
      return c.json({ success: true });
    }
  )
  .get("/current", 
    jwtMiddleware,
    async (c) => {
      const user = c.get("user");

      return c.json({ data: user });
    }
  )
  .post("/logout", jwtMiddleware,async (c) => {

    deleteCookie(c, JWT_AUTH);

    return c.json({ success: true });
  })
  ;

export default app;
