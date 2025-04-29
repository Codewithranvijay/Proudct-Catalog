"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Download, Loader2, RefreshCw, Shield, User } from "lucide-react"
import Image from "next/image"

interface LoginRecord {
  timestamp: string
  email: string
  status: string
  message: string
  ipAddress?: string
}

interface UserSession {
  email: string
  authenticated: boolean
  loginTime: string
  isAdmin: boolean
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [fetchingSheetLogs, setFetchingSheetLogs] = useState(false)
  const [localLoginHistory, setLocalLoginHistory] = useState<LoginRecord[]>([])
  const [sheetLoginHistory, setSheetLoginHistory] = useState<LoginRecord[]>([])
  const [userSession, setUserSession] = useState<UserSession | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if the user is authenticated and is an admin
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

      if (!session.isAdmin) {
        // Not an admin, redirect to home
        router.push("/")
        return
      }

      setUserSession(session)

      // Load local login history
      const history = JSON.parse(localStorage.getItem("loginHistory") || "[]") as LoginRecord[]
      setLocalLoginHistory(history.reverse()) // Show newest first

      // Fetch logs from Google Sheets
      fetchGoogleSheetLogs()
    } catch (error) {
      console.error("Error parsing session:", error)
      router.push("/login")
      return
    }

    setLoading(false)
  }, [router])

  const fetchGoogleSheetLogs = async () => {
    setFetchingSheetLogs(true)
    try {
      // Google Sheets API endpoint for log tab
      const spreadsheetId = "1WnGoJIbIzytPwS54gHAP7h-ZxeBKGxnQv1OOVPZMcoE"
      const sheetName = "log" // The tab name in your Google Sheet
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
        setSheetLoginHistory([])
        return
      }

      // Process the log data
      // Assuming column A: timestamp, B: email, C: status, D: message, E: IP
      const logs: LoginRecord[] = data.values
        .slice(1)
        .map((row: string[]) => ({
          timestamp: row[0] || "",
          email: row[1] || "",
          status: row[2] || "",
          message: row[3] || "",
          ipAddress: row[4] || "",
        }))
        .reverse() // Show newest first

      setSheetLoginHistory(logs)
    } catch (error) {
      console.error("Failed to fetch Google Sheet logs:", error)
    } finally {
      setFetchingSheetLogs(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString()
    } catch (e) {
      return dateString
    }
  }

  const clearLocalHistory = () => {
    localStorage.removeItem("loginHistory")
    setLocalLoginHistory([])
  }

  const exportToCSV = (logs: LoginRecord[], filename: string) => {
    if (logs.length === 0) return

    // Create CSV content
    const headers = ["Timestamp", "Email", "Status", "Message", "IP Address"]
    const csvContent = [
      headers.join(","),
      ...logs.map((record) => {
        return [
          `"${record.timestamp}"`,
          `"${record.email}"`,
          `"${record.status}"`,
          `"${record.message}"`,
          `"${record.ipAddress || ""}"`,
        ].join(",")
      }),
    ].join("\n")

    // Create a blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}_${new Date().toISOString()}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-36">
              <Image
                src="https://lh3.googleusercontent.com/d/1pMIJ-KTCUVcIAinU7A88PUG550hBGia-"
                alt="Company Logo"
                fill
                className="object-contain"
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=48&width=144"
                }}
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-primary md:text-2xl">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Logged in as: {userSession?.email} <Shield className="inline h-4 w-4 text-green-500" />
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Catalog
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <Tabs defaultValue="google-sheet-logs" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="google-sheet-logs">Google Sheet Logs</TabsTrigger>
            <TabsTrigger value="local-logs">Local Browser Logs</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>

          <TabsContent value="google-sheet-logs">
            <Card>
              <CardHeader>
                <CardTitle>Google Sheet Login History</CardTitle>
                <CardDescription>
                  View all login attempts logged to your Google Sheet. This data is stored in the "log" tab.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end space-x-2 mb-4">
                  <Button variant="outline" size="sm" onClick={fetchGoogleSheetLogs} disabled={fetchingSheetLogs}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${fetchingSheetLogs ? "animate-spin" : ""}`} />
                    {fetchingSheetLogs ? "Refreshing..." : "Refresh"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToCSV(sheetLoginHistory, "google_sheet_logs")}
                    disabled={sheetLoginHistory.length === 0}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export to CSV
                  </Button>
                </div>

                {fetchingSheetLogs ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : sheetLoginHistory.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead>IP Address</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sheetLoginHistory.map((record, index) => (
                          <TableRow key={index}>
                            <TableCell>{formatDate(record.timestamp)}</TableCell>
                            <TableCell>{record.email}</TableCell>
                            <TableCell>
                              <span
                                className={
                                  record.status === "Success"
                                    ? "text-green-600 font-medium"
                                    : "text-red-600 font-medium"
                                }
                              >
                                {record.status}
                              </span>
                            </TableCell>
                            <TableCell>{record.message}</TableCell>
                            <TableCell>{record.ipAddress}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No login history available in Google Sheet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="local-logs">
            <Card>
              <CardHeader>
                <CardTitle>Local Browser Login History</CardTitle>
                <CardDescription>
                  View login attempts stored in your browser's local storage. This data is only available on this
                  device.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end space-x-2 mb-4">
                  <Button variant="outline" size="sm" onClick={clearLocalHistory}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Clear History
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToCSV(localLoginHistory, "local_logs")}
                    disabled={localLoginHistory.length === 0}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export to CSV
                  </Button>
                </div>

                {localLoginHistory.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Message</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {localLoginHistory.map((record, index) => (
                          <TableRow key={index}>
                            <TableCell>{formatDate(record.timestamp)}</TableCell>
                            <TableCell>{record.email}</TableCell>
                            <TableCell>
                              <span
                                className={
                                  record.status === "Success"
                                    ? "text-green-600 font-medium"
                                    : "text-red-600 font-medium"
                                }
                              >
                                {record.status}
                              </span>
                            </TableCell>
                            <TableCell>{record.message}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No local login history available</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage users from your Google Sheet. Users with "SUPREME" in column C have admin access.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mt-6">
                  <h3 className="font-medium mb-4">User List</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Last Login</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>admin@example.com</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Shield className="mr-1 h-4 w-4 text-green-500" />
                              SUPREME
                            </div>
                          </TableCell>
                          <TableCell>{new Date().toLocaleString()}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" disabled>
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>user@example.com</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <User className="mr-1 h-4 w-4" />
                              Standard
                            </div>
                          </TableCell>
                          <TableCell>{new Date().toLocaleString()}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" disabled>
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Admin Dashboard. All rights reserved.</p>
      </footer>
    </div>
  )
}
