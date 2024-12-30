"use client"
import { Button } from "@/components/ui/button";
import { useCurrent } from "@/features/auth/api/use-current";
import { useLogout } from "@/features/auth/api/use-logout";
import { useRouter } from "next/router";
import { useEffect } from "react";


export default function Home() {
  const router = useRouter()
  const { data, isLoading } = useCurrent()
  const { mutate } = useLogout()


  useEffect(() => {
    if (!data && !isLoading) {
      router.push("/sign-in")
    }
  
  }, [data])
  
  return (
    <div>
      Only visible to authorized users
      <Button onClick={() =>  mutate() }>
        logout
      </Button>
    </div>
  );
}
