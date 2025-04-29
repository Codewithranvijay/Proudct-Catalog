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
        <Button variant="outline" size="sm" className="h-8 px-2 md:h-9 md:px-3 gap-1 md:gap-2">
          <History className="h-4 w-4" />
          <span className="hidden md:inline">Login History</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] w-[95vw] max-w-[95vw] sm:w-auto">
        <DialogHeader className="px-2 md:px-0">
          <DialogTitle className="text-lg md:text-xl">Login History</DialogTitle>
          <DialogDescription className="text-xs md:text-sm">
            Recent login attempts are shown below. This data is stored locally in your browser.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 md:mt-4 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={clearHistory}
            className="h-8 px-2 md:h-9 md:px-3 text-xs md:text-sm"
          >
            Clear History
          </Button>
        </div>

        <ScrollArea className="h-[300px] md:h-[400px] mt-2">
          {loginHistory.length > 0 ? (
            <div className="w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px] md:w-[180px]">Time</TableHead>
                    <TableHead className="min-w-[120px]">Email</TableHead>
                    <TableHead className="w-[80px]">Status</TableHead>
                    <TableHead className="min-w-[120px]">Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loginHistory.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="whitespace-nowrap text-xs md:text-sm">
                        {formatDate(record.timestamp)}
                      </TableCell>
                      <TableCell className="text-xs md:text-sm">{record.email}</TableCell>
                      <TableCell>
                        <span
                          className={
                            record.status === "Success"
                              ? "text-green-600 font-medium text-xs md:text-sm"
                              : "text-red-600 font-medium text-xs md:text-sm"
                          }
                        >
                          {record.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs md:text-sm">{record.message}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">No login history available</div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
