"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Google Sheets API endpoint for login tab
      const spreadsheetId = "1WnGoJIbIzytPwS54gHAP7h-ZxeBKGxnQv1OOVPZMcoE"
      const sheetName = "login" // The tab name in your Google Sheet
      const apiKey = "AIzaSyAmvqtdeTd6j8nTeLnnCD__vHymykdASZQ"
      const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`

      // Fetch data from Google Sheets
      const response = await fetch(apiUrl, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.values || data.values.length <= 1) {
        setError("Invalid credentials")
        return
      }

      // Check credentials against the Google Sheet
      // Assuming column A contains emails and column B contains passwords
      const userRow = data.values.find((row: string[]) => row[0] === email)

      if (userRow && userRow[1] === password) {
        // Credentials match - set a session in localStorage
        const timestamp = new Date().toISOString()

        // Store login info
        localStorage.setItem(
          "session",
          JSON.stringify({
            email,
            authenticated: true,
            loginTime: timestamp,
          }),
        )

        // Store login history
        const loginHistory = JSON.parse(localStorage.getItem("loginHistory") || "[]")
        loginHistory.push({
          timestamp,
          email,
          status: "Success",
          message: "Login successful",
        })
        localStorage.setItem("loginHistory", JSON.stringify(loginHistory))

        // Redirect to catalog page on successful login
        router.push("/")
      } else {
        setError("Invalid credentials")

        // Store failed login attempt in history
        const timestamp = new Date().toISOString()
        const loginHistory = JSON.parse(localStorage.getItem("loginHistory") || "[]")
        loginHistory.push({
          timestamp,
          email,
          status: "Failed",
          message: "Invalid credentials",
        })
        localStorage.setItem("loginHistory", JSON.stringify(loginHistory))
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred during login. Please try again.")

      // Store error in login history
      const timestamp = new Date().toISOString()
      const loginHistory = JSON.parse(localStorage.getItem("loginHistory") || "[]")
      loginHistory.push({
        timestamp,
        email,
        status: "Error",
        message: "System error during login",
      })
      localStorage.setItem("loginHistory", JSON.stringify(loginHistory))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative h-16 w-48">
              <Image
                src="https://lh3.googleusercontent.com/d/1pMIJ-KTCUVcIAinU7A88PUG550hBGia-"
                alt="Company Logo"
                width={192}
                height={64}
                className="object-contain"
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=64&width=192"
                }}
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Enter your credentials to access the product catalog</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">{error}</div>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
