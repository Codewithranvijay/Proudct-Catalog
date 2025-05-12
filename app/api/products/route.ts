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
        industry: row[2] || "",
        theme: row[3] || "",
        subCategory: row[4] || "",
        productName: row[5] || "",
        image: imageUrl,
        description: description,
        rate: row[8] || "0",
        budget: row[9] || "0",
        allFilter: row[10] || "",
        productCategory: row[11] || "",
        ranking: ranking, // Add ranking field
      }

      products.push(product)
    }

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
