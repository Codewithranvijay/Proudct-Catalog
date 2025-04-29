import { google } from "googleapis"
import { type NextRequest, NextResponse } from "next/server"

// Create OAuth2 client with environment variables
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
)

// Set credentials from environment variables
oauth2Client.setCredentials({
  access_token: process.env.GOOGLE_ACCESS_TOKEN,
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
})

// Create Google Sheets API client
const sheets = google.sheets({ version: "v4", auth: oauth2Client })

export async function POST(request: NextRequest) {
  try {
    const { email, status, message } = await request.json()

    // Validate required fields
    if (!email || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID
    const sheetName = "log" // The tab name for logging
    const timestamp = new Date().toISOString()

    // Get IP address from request (or forwarded header if behind proxy)
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown"

    // Prepare the row data
    const rowData = [timestamp, email, status, message, ipAddress]

    // Append the row to the Google Sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: sheetName,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [rowData],
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error logging to Google Sheets:", error)
    return NextResponse.json({ error: "Failed to log to Google Sheets" }, { status: 500 })
  }
}
