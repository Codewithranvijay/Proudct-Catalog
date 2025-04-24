import { type NextRequest, NextResponse } from "next/server"
import { generatePDF } from "@/scripts/generate-pdf"
import path from "path"
import fs from "fs"
import os from "os"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { clientName, categories, themes, occasions, priceRange } = data

    // Create a temporary file path
    const tempDir = os.tmpdir()
    const outputPath = path.join(tempDir, `Product_Catalog_${Date.now()}.pdf`)

    // Generate the PDF
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

    await generatePDF(baseUrl, outputPath, {
      filters: {
        clientName,
        categories,
        themes,
        occasions,
        priceRange,
      },
    })

    // Read the generated PDF
    const pdfBuffer = fs.readFileSync(outputPath)

    // Clean up the temporary file
    fs.unlinkSync(outputPath)

    // Return the PDF as a response
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Product_Catalog.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
