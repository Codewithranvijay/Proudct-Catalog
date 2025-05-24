import { NextResponse } from "next/server"
import type { Product } from "@/lib/types"

// Function to convert Google Drive links to direct image URLs
function convertDriveLink(url: string): string {
  if (!url || typeof url !== "string") {
    return "https://via.placeholder.com/300"
  }

  const match = url.match(/(?:\/d\/|id=)([a-zA-Z0-9_-]+)/)
  if (match) {
    return `https://lh3.googleusercontent.com/d/${match[1]}=s600`
  }

  return url
}

export async function GET() {
  try {
    // Google Sheets API endpoint
    const spreadsheetId = "1WnGoJIbIzytPwS54gHAP7h-ZxeBKGxnQv1OOVPZMcoE"
    const sheetName = "STANDARD"
    const apiKey = "AIzaSyAmvqtdeTd6j8nTeLnnCD__vHymykdASZQ"
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`

    // Fetch data from Google Sheets
    const response = await fetch(apiUrl, {
      // Add cache: 'no-store' to prevent caching issues during deployment
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
      return NextResponse.json([])
    }

    // Process the data similar to the original getProductData function
    const products: Product[] = []

    // Skip the header row (index 0)
    for (let i = 1; i < data.values.length; i++) {
      const row = data.values[i]

      // Skip rows that don't have enough data
      if (row.length < 9) continue

      // Convert Google Drive link to a direct image link
      const rawImageUrl = row[6] || "" // Column G contains image links
      const imageUrl = convertDriveLink(rawImageUrl)

      // Format description with HTML
      let description = row[7] || ""
      description = description.replace(/\n/g, "<br>") // Replace newlines with <br>

      // Get ranking from column N (index 13)
      const rankingValue = row[13] || "0"
      const ranking = Number.parseFloat(rankingValue) || 0

      const product: Product = {
        occasion: row[1] || "",
        customizationType: row[2] || "", // Column C - new customization type
        industry: row[3] || "", // Shift industry to column D
        theme: row[4] || "", // Shift theme to column E
        subCategory: row[5] || "", // Shift subCategory to column F
        productName: row[6] || "", // Shift productName to column G
        image: convertDriveLink(row[7] || ""), // Shift image to column H
        description: (row[8] || "").replace(/\n/g, "<br>"), // Shift description to column I
        rate: row[9] || "0", // Shift rate to column J
        budget: row[10] || "0", // Shift budget to column K
        allFilter: row[11] || "", // Shift allFilter to column L
        productCategory: row[12] || "", // Shift productCategory to column M
        ranking: Number.parseFloat(row[14] || "0") || 0, // Column O (index 14) for ranking
      }

      products.push(product)
    }

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
