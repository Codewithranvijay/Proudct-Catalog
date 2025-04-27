import { jsPDF } from "jspdf"
import type { Product } from "./types"

// Function to preload an image and return it as a base64 data URL
const preloadImage = async (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")
      ctx?.drawImage(img, 0, 0)
      resolve(canvas.toDataURL("image/jpeg"))
    }
    img.onerror = () => {
      console.warn(`Failed to load image: ${url}`)
      resolve("/placeholder.svg?height=200&width=300")
    }
    img.src = url
    // Set a timeout in case the image doesn't load
    setTimeout(() => {
      if (!img.complete) {
        console.warn(`Image load timed out: ${url}`)
        resolve("/placeholder.svg?height=200&width=300")
      }
    }, 5000)
  })
}

// Load company logo for the cover page
const loadCompanyLogo = async (): Promise<string> => {
  try {
    return await preloadImage("https://lh3.googleusercontent.com/d/1pMIJ-KTCUVcIAinU7A88PUG550hBGia-")
  } catch (error) {
    console.error("Error loading company logo:", error)
    return ""
  }
}

// Add standard fonts to ensure proper symbol rendering
const addFontsToDocument = (pdf: jsPDF) => {
  // Standard fonts are already included in jsPDF
  // We'll use Helvetica for most text and Symbol for special characters
  pdf.setFont("helvetica", "normal")
}

export async function generateProductCatalogPDF(
  products: Product[],
  clientName: string,
  categories: string[],
  themes: string[],
  occasions: string[],
  priceRange: [number, number],
  discount = 0,
): Promise<Blob> {
  try {
    // Create a new jsPDF instance
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Add fonts to ensure proper symbol rendering
    addFontsToDocument(pdf)

    // Define page dimensions
    const pageWidth = 210 // A4 portrait width in mm
    const pageHeight = 297 // A4 portrait height in mm
    const margin = 24 // margin in mm (24px converted to mm)
    const contentWidth = pageWidth - 2 * margin

    // Load company logo
    const logoDataUrl = await loadCompanyLogo()

    // Add cover page with styling similar to web view
    // Add gradient background similar to web view
    pdf.setFillColor(245, 247, 250) // Light blue-gray background
    pdf.rect(0, 0, pageWidth, pageHeight, "F")

    // Add logo
    if (logoDataUrl) {
      pdf.addImage(logoDataUrl, "JPEG", margin, margin, 60, 40)
    }

    // Title
    pdf.setFontSize(28)
    pdf.setTextColor(59, 130, 246) // Primary blue color
    pdf.setFont("helvetica", "bold")
    pdf.text("Product Catalog", margin, margin + 60)

    // Date
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(100, 100, 100)
    pdf.text(`Date: ${new Date().toLocaleDateString("en-GB")}`, margin, margin + 75)

    // Client info
    pdf.setFontSize(12)
    pdf.setTextColor(0, 0, 0)
    pdf.text(`Client: ${clientName || "N/A"}`, margin, margin + 90)

    // Categories
    if (categories.length > 0) {
      pdf.text(`Categories: ${categories.join(", ")}`, margin, margin + 105)
    }

    // Themes
    if (themes.length > 0) {
      pdf.text(`Themes: ${themes.join(", ")}`, margin, margin + 120)
    }

    // Occasions
    if (occasions.length > 0) {
      pdf.text(`Occasions: ${occasions.join(", ")}`, margin, margin + 135)
    }

    // Price range - using "Rs." instead of the Unicode Rupee symbol to avoid font issues
    pdf.text(`Price Range: Rs.${priceRange[0]} - Rs.${priceRange[1]}`, margin, margin + 150)

    // Discount information if applicable
    if (discount > 0) {
      pdf.text(`Discount Applied: ${discount}%`, margin, margin + 165)
    }

    // Process products - 2 products per page
    for (let i = 0; i < products.length; i += 2) {
      // Add a new page for each pair of products
      pdf.addPage()

      // First product on the page
      await addProductToPage(pdf, products[i], margin, margin, contentWidth, discount)

      // Second product on the page (if available)
      if (i + 1 < products.length) {
        await addProductToPage(pdf, products[i + 1], margin, pageHeight / 2 + 10, contentWidth, discount)
      }
    }

    // Return the PDF as a blob
    return pdf.output("blob")
  } catch (error) {
    console.error("PDF generation error:", error)
    throw new Error("Failed to generate PDF")
  }
}

// Helper function to add a product to the PDF
async function addProductToPage(
  pdf: jsPDF,
  product: Product,
  startX: number,
  startY: number,
  width: number,
  discount = 0,
) {
  const cardPadding = 10 // Card padding in mm
  const cardWidth = width
  const cardHeight = 120 // Card height in mm

  // Draw card background with subtle shadow effect
  pdf.setDrawColor(230, 230, 230)
  pdf.setFillColor(255, 255, 255)

  // Draw shadow effect
  pdf.setFillColor(240, 240, 240)
  pdf.roundedRect(startX + 2, startY + 2, cardWidth, cardHeight, 3, 3, "F")

  // Draw card
  pdf.setFillColor(255, 255, 255)
  pdf.roundedRect(startX, startY, cardWidth, cardHeight, 3, 3, "FD")

  // Product title
  pdf.setFontSize(14)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(0, 0, 0)
  pdf.text(product.productName || "N/A", startX + cardPadding, startY + cardPadding + 5)

  // Category and theme - using productCategory from column L instead of occasion
  pdf.setFontSize(10)
  pdf.setFont("helvetica", "normal")
  pdf.setTextColor(100, 100, 100)
  pdf.text(
    `Category: ${product.productCategory || "N/A"} • Theme: ${product.theme || "N/A"}`,
    startX + cardPadding,
    startY + cardPadding + 15,
  )

  // Description header
  pdf.setFontSize(10)
  pdf.setFont("helvetica", "bold")
  pdf.text("Description:", startX + cardPadding, startY + cardPadding + 25)

  // Description text
  pdf.setFontSize(9)
  pdf.setFont("helvetica", "normal")
  pdf.setTextColor(80, 80, 80)

  // Clean up description HTML
  const tempDiv = document.createElement("div")
  tempDiv.innerHTML = product.description
  const cleanDescription = tempDiv.textContent || tempDiv.innerText || "No description available"

  // Split description into lines
  const splitDescription = pdf.splitTextToSize(cleanDescription, width / 2 - cardPadding * 2) // Make room for image
  // Limit description to 6 lines
  const limitedDescription = splitDescription.slice(0, 6)
  pdf.text(limitedDescription, startX + cardPadding, startY + cardPadding + 35)

  // Try to add product image
  try {
    // Preload the image to avoid CORS issues
    const imageDataUrl = await preloadImage(product.image)

    // Add image to PDF (if available)
    if (imageDataUrl && imageDataUrl !== "/placeholder.svg?height=200&width=300") {
      pdf.addImage(
        imageDataUrl,
        "JPEG",
        startX + width / 2 + cardPadding,
        startY + cardPadding + 15,
        width / 2 - cardPadding * 3,
        60,
      )
    }
  } catch (error) {
    console.error("Error adding image:", error)
  }

  // Add price in a box
  const priceBoxWidth = 60
  const priceBoxHeight = 15
  const priceBoxX = startX + cardWidth / 2 - priceBoxWidth / 2
  const priceBoxY = startY + cardHeight - cardPadding - priceBoxHeight

  // Draw price box with light yellow background
  pdf.setFillColor(255, 251, 235)
  pdf.roundedRect(priceBoxX, priceBoxY, priceBoxWidth, priceBoxHeight, 2, 2, "F")

  // Calculate original and discounted price
  const originalPrice = Number.parseFloat(product.rate) || 0
  const discountedPrice = discount > 0 ? originalPrice - (originalPrice * discount) / 100 : null

  // Add price text with "Rs." instead of Unicode Rupee symbol to avoid font issues
  pdf.setFontSize(12)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(146, 64, 14) // Brown text color

  if (discountedPrice !== null) {
    const priceText = `Rs.${discountedPrice.toFixed(2)} (${discount}% off)`
    const priceTextWidth = pdf.getTextWidth(priceText)
    pdf.text(priceText, priceBoxX + (priceBoxWidth - priceTextWidth) / 2, priceBoxY + 8)
  } else {
    const priceText = `Rs.${originalPrice.toFixed(2) || "0.00"}`
    const priceTextWidth = pdf.getTextWidth(priceText)
    pdf.text(priceText, priceBoxX + (priceBoxWidth - priceTextWidth) / 2, priceBoxY + 8)
  }

  // Add GST text
  pdf.setFontSize(8)
  pdf.text("+ GST", priceBoxX + priceBoxWidth / 2, priceBoxY + 13, { align: "center" })
}
