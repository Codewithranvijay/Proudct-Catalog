"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Catalog from "@/components/catalog"
import { Loader2 } from "lucide-react"

export default function Home() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if the user is authenticated
    const sessionData = localStorage.getItem("session")

    if (!sessionData) {
      router.push("/login")
      return
    }

    try {
      const session = JSON.parse(sessionData)
      if (!session.authenticated) {
        router.push("/login")
        return
      }

      setUserEmail(session.email || "User")
    } catch (error) {
      console.error("Error parsing session:", error)
      router.push("/login")
      return
    }

    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return <Catalog userEmail={userEmail || "User"} />
}
