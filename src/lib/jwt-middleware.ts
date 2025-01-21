import { User } from '@prisma/client'
import { Next } from 'hono'
import { Context } from 'hono'
import { prisma } from './prisma-db'
import { createMiddleware } from 'hono/factory'
import { JWT_AUTH } from '@/features/auth/constants'
import { getCookie } from 'hono/cookie'
import jwt from 'jsonwebtoken'

interface JwtPayload {
  id: string  //user.id
  exp: number
}

type addtionalVariables =  {
    user: User
}

// const baseJwtMiddleware = jwt({
//   secret: process.env.JWT_SECRET!,
//   cookie: 'token'
// })
const baseJwtMiddleware = async (c: Context, next: Next) => {
    const token = getCookie(c, JWT_AUTH)    
    if (!token) {
      return c.json({ message: 'Unauthorized' }, 401)
    }
  
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
      c.set('jwtPayload', payload)
      await next()
    } catch (err) {
      console.log(err)
      return c.json({ message: 'Unauthorized' }, 401)
    }
  }
export const jwtMiddleware = createMiddleware<{
    Variables: addtionalVariables
}>(async (c: Context, next: Next) => {
    
    await baseJwtMiddleware(c, async () => { })

    const payload = c.get('jwtPayload') as JwtPayload

    if (!payload?.id) {
        return c.json({ message: 'Unauthorized' }, 401)
    }

    const user = await prisma.user.findUnique({
        where: { id: payload.id }
    })

    if (!user) {
        return c.json({ message: 'Unauthorized' }, 401)
    }

    c.set('user', user)

    return next()
})