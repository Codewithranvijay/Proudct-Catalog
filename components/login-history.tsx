"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { History } from "lucide-react"

interface LoginRecord {
  timestamp: string
  email: string
  status: string
  message: string
}

export function LoginHistory() {
  const [loginHistory, setLoginHistory] = useState<LoginRecord[]>([])

  useEffect(() => {
    // Load login history from localStorage
    const history = JSON.parse(localStorage.getItem("loginHistory") || "[]") as LoginRecord[]
    setLoginHistory(history.reverse()) // Show newest first
  }, [])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString()
    } catch (e) {
      return dateString
    }
  }

  const clearHistory = () => {
    localStorage.removeItem("loginHistory")
    setLoginHistory([])
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <History className="h-4 w-4" />
          <span className="hidden md:inline">Login History</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Login History</DialogTitle>
          <DialogDescription>
            Recent login attempts are shown below. This data is stored locally in your browser.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={clearHistory}>
            Clear History
          </Button>
        </div>

        <ScrollArea className="h-[400px] mt-2">
          {loginHistory.length > 0 ? (
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
                {loginHistory.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatDate(record.timestamp)}</TableCell>
                    <TableCell>{record.email}</TableCell>
                    <TableCell>
                      <span
                        className={
                          record.status === "Success" ? "text-green-600 font-medium" : "text-red-600 font-medium"
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">No login history available</div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
