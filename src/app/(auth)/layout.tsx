"use client"
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

interface AuthLayoutProps  {
    children: React.ReactNode
};


const AuthLayout = ({ children }: AuthLayoutProps) => {
  const pathname = usePathname()
  const isSignIn = pathname === "/sign-in"

  return (
    <main className='bg-neutral-100 min-h-screen'>
      <div className='mx-auto max-w-screen-2xl p-4'>
        <nav className='flex justify-between items-center'>
          <Image src="/logo.svg" height={56} width={152} alt='Logo' />
          <div className='flex items-center gap-2'>
            <Button asChild variant={"secondary"}>
              <Link href={isSignIn ? "/sign-up" : "/sign-in"}>
              {isSignIn ? "Sign up" : "Login"}
              </Link>
            </Button>
          </div>
        </nav>
        <div className='flex flex-col items-center justify-center pt-4 md:pt-14'>
          {children}
        </div>
      </div>
    </main>
  )
}

export default AuthLayout