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
        localStorage.setItem("session", JSON.stringify({ email, authenticated: true }))

        // Log login attempt (optional)
        try {
          await logLoginAttempt(email, true, "Success")
        } catch (logError) {
          console.error("Error logging login attempt:", logError)
          // Continue with login even if logging fails
        }

        // Redirect to catalog page on successful login
        router.push("/")
      } else {
        setError("Invalid credentials")

        // Log failed login attempt (optional)
        try {
          await logLoginAttempt(email, false, "Invalid credentials")
        } catch (logError) {
          console.error("Error logging login attempt:", logError)
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred during login. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Function to log login attempts to Google Sheets
  async function logLoginAttempt(email: string, success: boolean, message: string): Promise<void> {
    try {
      // Google Sheets API endpoint for log tab
      const spreadsheetId = "1WnGoJIbIzytPwS54gHAP7h-ZxeBKGxnQv1OOVPZMcoE"
      const sheetName = "log" // The tab name for logging
      const apiKey = "AIzaSyAmvqtdeTd6j8nTeLnnCD__vHymykdASZQ"
      const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}:append?valueInputOption=USER_ENTERED&key=${apiKey}`

      // Current timestamp
      const timestamp = new Date().toISOString()

      // IP address (in a real app, you would get this from the request)
      const ipAddress = "Unknown" // For privacy reasons, we're not capturing real IP

      // Prepare the row data
      const rowData = [timestamp, email, success ? "Success" : "Failed", message, ipAddress]

      // Append the row to the Google Sheet
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          range: sheetName,
          majorDimension: "ROWS",
          values: [rowData],
        }),
      })

      if (!response.ok) {
        console.error("Failed to log login attempt:", await response.text())
      }
    } catch (error) {
      console.error("Error logging login attempt:", error)
      // Don't throw the error - logging failure shouldn't affect the login process
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
