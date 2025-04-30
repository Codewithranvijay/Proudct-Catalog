"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, User, Shield } from "lucide-react"
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
  isAdmin?: boolean
}

export function UserMenu({ email, isAdmin = false }: UserMenuProps) {
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

      // Log to Google Sheets
      await logToGoogleSheets(email, "Success", "User logged out")

      // Clear the session from localStorage  "Success", "User logged out")

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

  // Function to log to Google Sheets
  async function logToGoogleSheets(email: string, status: string, message: string): Promise<void> {
    try {
      const response = await fetch("/api/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          status,
          message,
        }),
      })

      if (!response.ok) {
        console.error("Failed to log to Google Sheets:", await response.text())
      }
    } catch (error) {
      console.error("Error logging to Google Sheets:", error)
      // Continue even if logging fails
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 px-2 md:h-9 md:px-3 gap-1 md:gap-2">
          {isAdmin ? <Shield className="h-4 w-4 text-green-500" /> : <User className="h-4 w-4" />}
          <span className="hidden md:inline">{email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 md:w-56">
        <DropdownMenuLabel className="text-xs md:text-sm">
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <Shield className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
              <span>Admin Account</span>
            </div>
          ) : (
            "My Account"
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-xs md:text-sm cursor-pointer"
          onClick={() => router.push("/admin")}
          disabled={!isAdmin}
        >
          <Shield className="mr-2 h-3 w-3 md:h-4 md:w-4" />
          <span>Admin Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs md:text-sm cursor-pointer" onClick={handleLogout} disabled={loading}>
          <LogOut className="mr-2 h-3 w-3 md:h-4 md:w-4" />
          <span>{loading ? "Logging out..." : "Logout"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
