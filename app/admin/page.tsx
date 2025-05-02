"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Download, Loader2, Menu, RefreshCw, Shield, User } from "lucide-react"
import Image from "next/image"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("google-sheet-logs")
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
        <div className="container flex items-center justify-between py-2 md:py-4">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative h-10 w-24 md:h-12 md:w-36">
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
              <h1 className="text-lg font-bold text-primary md:text-2xl">Admin</h1>
              <p className="text-xs text-muted-foreground md:text-sm">
                {userSession?.email} <Shield className="inline h-3 w-3 md:h-4 md:w-4 text-green-500" />
              </p>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] sm:w-[300px]">
                <div className="flex flex-col gap-4 py-4">
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      router.push("/")
                      setMobileMenuOpen(false)
                    }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Catalog
                  </Button>

                  <div className="flex flex-col gap-2 mt-4">
                    <p className="text-sm font-medium mb-2">Dashboard Sections</p>
                    <Button
                      variant={activeTab === "google-sheet-logs" ? "default" : "ghost"}
                      className="justify-start"
                      onClick={() => {
                        setActiveTab("google-sheet-logs")
                        setMobileMenuOpen(false)
                      }}
                    >
                      Google Sheet Logs
                    </Button>
                    <Button
                      variant={activeTab === "local-logs" ? "default" : "ghost"}
                      className="justify-start"
                      onClick={() => {
                        setActiveTab("local-logs")
                        setMobileMenuOpen(false)
                      }}
                    >
                      Local Browser Logs
                    </Button>
                    <Button
                      variant={activeTab === "users" ? "default" : "ghost"}
                      className="justify-start"
                      onClick={() => {
                        setActiveTab("users")
                        setMobileMenuOpen(false)
                      }}
                    >
                      User Management
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Catalog
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-3 md:py-6">
        <Tabs defaultValue="google-sheet-logs" value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Mobile tabs - stacked vertically */}
          <div className="md:hidden mb-4">
            <div className="flex flex-col space-y-2">
              <Button
                variant={activeTab === "google-sheet-logs" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setActiveTab("google-sheet-logs")}
              >
                Google Sheet Logs
              </Button>
              <Button
                variant={activeTab === "local-logs" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setActiveTab("local-logs")}
              >
                Local Browser Logs
              </Button>
              <Button
                variant={activeTab === "users" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setActiveTab("users")}
              >
                User Management
              </Button>
            </div>
          </div>

          {/* Desktop tabs - horizontal */}
          <TabsList className="hidden md:grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="google-sheet-logs" className="text-sm">
              Google Sheet Logs
            </TabsTrigger>
            <TabsTrigger value="local-logs" className="text-sm">
              Local Browser Logs
            </TabsTrigger>
            <TabsTrigger value="users" className="text-sm">
              User Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="google-sheet-logs">
            <Card>
              <CardHeader className="px-3 py-3 md:px-6 md:py-6">
                <CardTitle className="text-lg md:text-xl">Google Sheet Login History</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  View all login attempts logged to your Google Sheet. This data is stored in the "log" tab.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-3 pb-3 md:px-6 md:pb-6">
                <div className="flex justify-end space-x-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchGoogleSheetLogs}
                    disabled={fetchingSheetLogs}
                    className="h-8 text-xs"
                  >
                    <RefreshCw className={`mr-2 h-3 w-3 md:h-4 md:w-4 ${fetchingSheetLogs ? "animate-spin" : ""}`} />
                    <span className="hidden sm:inline">{fetchingSheetLogs ? "Refreshing..." : "Refresh"}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToCSV(sheetLoginHistory, "google_sheet_logs")}
                    disabled={sheetLoginHistory.length === 0}
                    className="h-8 text-xs"
                  >
                    <Download className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </div>

                {fetchingSheetLogs ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : sheetLoginHistory.length > 0 ? (
                  <div className="overflow-hidden rounded-md border">
                    <div className="overflow-x-auto w-full">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px] md:w-[180px] whitespace-nowrap">Time</TableHead>
                            <TableHead className="min-w-[100px]">Email</TableHead>
                            <TableHead className="w-[70px]">Status</TableHead>
                            <TableHead className="min-w-[100px]">Message</TableHead>
                            <TableHead className="hidden md:table-cell">IP Address</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sheetLoginHistory.map((record, index) => (
                            <TableRow key={index}>
                              <TableCell className="whitespace-nowrap text-xs md:text-sm py-2">
                                {formatDate(record.timestamp)}
                              </TableCell>
                              <TableCell className="text-xs md:text-sm py-2 truncate max-w-[120px]">
                                {record.email}
                              </TableCell>
                              <TableCell className="py-2">
                                <span
                                  className={cn(
                                    "text-xs md:text-sm font-medium",
                                    record.status === "Success" ? "text-green-600" : "text-red-600",
                                  )}
                                >
                                  {record.status}
                                </span>
                              </TableCell>
                              <TableCell className="text-xs md:text-sm py-2 truncate max-w-[120px]">
                                {record.message}
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-xs md:text-sm py-2">
                                {record.ipAddress}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
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
              <CardHeader className="px-3 py-3 md:px-6 md:py-6">
                <CardTitle className="text-lg md:text-xl">Local Browser Login History</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  View login attempts stored in your browser's local storage. This data is only available on this
                  device.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-3 pb-3 md:px-6 md:pb-6">
                <div className="flex justify-end space-x-2 mb-4">
                  <Button variant="outline" size="sm" onClick={clearLocalHistory} className="h-8 text-xs">
                    <RefreshCw className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Clear</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToCSV(localLoginHistory, "local_logs")}
                    disabled={localLoginHistory.length === 0}
                    className="h-8 text-xs"
                  >
                    <Download className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </div>

                {localLoginHistory.length > 0 ? (
                  <div className="overflow-hidden rounded-md border">
                    <div className="overflow-x-auto w-full">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px] md:w-[180px] whitespace-nowrap">Time</TableHead>
                            <TableHead className="min-w-[100px]">Email</TableHead>
                            <TableHead className="w-[70px]">Status</TableHead>
                            <TableHead className="min-w-[100px]">Message</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {localLoginHistory.map((record, index) => (
                            <TableRow key={index}>
                              <TableCell className="whitespace-nowrap text-xs md:text-sm py-2">
                                {formatDate(record.timestamp)}
                              </TableCell>
                              <TableCell className="text-xs md:text-sm py-2 truncate max-w-[120px]">
                                {record.email}
                              </TableCell>
                              <TableCell className="py-2">
                                <span
                                  className={cn(
                                    "text-xs md:text-sm font-medium",
                                    record.status === "Success" ? "text-green-600" : "text-red-600",
                                  )}
                                >
                                  {record.status}
                                </span>
                              </TableCell>
                              <TableCell className="text-xs md:text-sm py-2 truncate max-w-[120px]">
                                {record.message}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No local login history available</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader className="px-3 py-3 md:px-6 md:py-6">
                <CardTitle className="text-lg md:text-xl">User Management</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  View and manage users from your Google Sheet. Users with "SUPREME" in column C have admin access.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-3 pb-3 md:px-6 md:pb-6">
                <div className="mt-2 md:mt-6">
                  <h3 className="font-medium mb-4 text-sm md:text-base">User List</h3>
                  <div className="overflow-hidden rounded-md border">
                    <div className="overflow-x-auto w-full">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[100px]">Email</TableHead>
                            <TableHead className="w-[80px]">Role</TableHead>
                            <TableHead className="hidden md:table-cell w-[120px]">Last Login</TableHead>
                            <TableHead className="w-[70px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="text-xs md:text-sm py-2 truncate max-w-[120px]">
                              admin@example.com
                            </TableCell>
                            <TableCell className="py-2">
                              <div className="flex items-center">
                                <Shield className="mr-1 h-3 w-3 md:h-4 md:w-4 text-green-500" />
                                <span className="text-xs md:text-sm">SUPREME</span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-xs md:text-sm py-2 whitespace-nowrap">
                              {new Date().toLocaleString()}
                            </TableCell>
                            <TableCell className="py-2">
                              <Button variant="ghost" size="sm" disabled className="h-7 px-2 text-xs">
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-xs md:text-sm py-2 truncate max-w-[120px]">
                              user@example.com
                            </TableCell>
                            <TableCell className="py-2">
                              <div className="flex items-center">
                                <User className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                                <span className="text-xs md:text-sm">Standard</span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-xs md:text-sm py-2 whitespace-nowrap">
                              {new Date().toLocaleString()}
                            </TableCell>
                            <TableCell className="py-2">
                              <Button variant="ghost" size="sm" disabled className="h-7 px-2 text-xs">
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t py-4 md:py-6 text-center text-xs md:text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Admin Dashboard. All rights reserved.</p>
      </footer>
    </div>
  )
}
