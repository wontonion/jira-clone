import { AUTH_COOKIE } from '@/features/auth/constants';
import { User } from '@prisma/client';
import { Session } from 'hono-sessions';
import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import { prisma } from './prisma-db';
import { Account, Client, Databases,Models,Storage, type Account as AccountType, type Databases as DatabasesType, type Storage as StorageType, type Users as UsersType} from 'node-appwrite';




// export const sessionMiddleware = createMiddleware<{
//     Variables: {
//         user: User
//     }
// }>(
//     async (c, next) => {
        
//         const session = c.get("session")
//         if (!session) {
//             return c.json({ error: 'Unauthorized: No session' }, 401)
//         }
//         const sessionUser = await session.get("user")

//         if (!sessionUser) {
//             return c.json({ error: 'Unauthorized: No session user' }, 401)
//         }

//         const dbUser = await prisma.user.findUnique({
//             where: {id: sessionUser.id}
//         })

//         if (!dbUser) {
//             return c.json({ error: 'Unauthorized: User not found' }, 401)

//         }
//         c.set("user", dbUser)
//         await next()
//     }
// )
                        




type AdditionalContext = {
    Variables: {
        account: AccountType,
        databases: DatabasesType,
        storage: StorageType,
        users: UsersType,
        user: Models.User<Models.Preferences>
    }
}

export const sessionMiddleware = createMiddleware<AdditionalContext>(
    async (c, next) => {
        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
    
        const session = getCookie(c, AUTH_COOKIE)
        
        if (!session) {
            return c.json({ error: 'Unauthorized' }, 401)
        }
        
        // if session is valid, add more context to the request
        client.setSession(session)
        const account = new Account(client)
        const databases = new Databases(client)
        const storage = new Storage(client)

        const user = await account.get()

        c.set("account", account)
        c.set("databases", databases)
        c.set("storage", storage)
        c.set("user", user)

        await next()

    }

)