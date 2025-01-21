// import { AUTH_COOKIE } from "@/features/auth/constants";
// import { createAdminClient } from "@/lib/appwrite";
// import { cookies } from "next/headers";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(request: NextRequest) {
//   const userId = request.nextUrl.searchParams.get("userId");
//   const secret = request.nextUrl.searchParams.get("secret");

//   if (!userId || !secret) {
//     return new NextResponse("Invalid request: userId or secret is missing", { status: 400 });
//   }

//   const { account } = await createAdminClient();
//   const session = await account.createSession(userId, secret);

//   cookies().set(AUTH_COOKIE, session.secret, {
//     path: "/",
//     httpOnly: true,
//     sameSite: "strict",
//     secure: true,
//   });
//   console.log(request.nextUrl.origin)
//   return NextResponse.redirect(`${request.nextUrl.origin}`);
// }
