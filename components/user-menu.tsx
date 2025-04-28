"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserMenuProps {
  email: string
}

export function UserMenu({ email }: UserMenuProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setLoading(true)
    try {
      // Store logout in login history
      const timestamp = new Date().toISOString()
      const loginHistory = JSON.parse(localStorage.getItem("loginHistory") || "[]")
      loginHistory.push({
        timestamp,
        email,
        status: "Success",
        message: "User logged out",
      })
      localStorage.setItem("loginHistory", JSON.stringify(loginHistory))

      // Clear the session from localStorage
      localStorage.removeItem("session")

      // Redirect to login page
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <User className="h-4 w-4" />
          <span className="hidden md:inline">{email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} disabled={loading}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{loading ? "Logging out..." : "Logout"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
