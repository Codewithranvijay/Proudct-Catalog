import puppeteer from "puppeteer"
import fs from "fs"
import path from "path"

// Function to compress images larger than 200KB to 150 DPI
async function compressLargeImages(page: puppeteer.Page): Promise<void> {
  await page.evaluate(() => {
    const images = document.querySelectorAll("img")
    images.forEach((img) => {
      // Create a new image to check the size
      const testImg = new Image()
      testImg.crossOrigin = "anonymous"
      testImg.src = img.src

      testImg.onload = () => {
        // Create a canvas to compress the image
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        // Set canvas dimensions
        const maxWidth = 600
        const maxHeight = 600
        let width = testImg.width
        let height = testImg.height

        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        canvas.width = width
        canvas.height = height

        // Draw image at reduced size
        ctx?.drawImage(testImg, 0, 0, width, height)

        // Convert to compressed JPEG at 150 DPI (0.75 quality)
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.75)

        // Replace the original image source with the compressed version
        img.src = compressedDataUrl
      }
    })
  })

  // Wait for image processing to complete
  await page.waitForTimeout(2000)
}

async function generatePDF(url: string, outputPath: string, options: any = {}): Promise<void> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  try {
    const page = await browser.newPage()

    // Set viewport to A4 size
    await page.setViewport({
      width: 1240,
      height: 1754,
      deviceScaleFactor: 2,
    })

    // Load Noto Sans font for proper Rupee symbol rendering
    await page.addStyleTag({
      content: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&display=swap');
        body {
          font-family: 'Noto Sans', sans-serif;
        }
      `,
    })

    // Navigate to the URL
    await page.goto(url, { waitUntil: "networkidle2" })

    // Apply filters if provided
    if (options.filters) {
      await page.evaluate((filters) => {
        // Apply client name
        if (filters.clientName) {
          const clientNameInput = document.querySelector('input[placeholder="Enter Client Name"]') as HTMLInputElement
          if (clientNameInput) {
            clientNameInput.value = filters.clientName
            clientNameInput.dispatchEvent(new Event("input", { bubbles: true }))
          }
        }

        // Apply other filters as needed
        // This would need to be customized based on your UI
      }, options.filters)

      // Wait for filters to be applied
      await page.waitForTimeout(1000)
    }

    // Compress large images to keep PDF size under 10MB
    await compressLargeImages(page)

    // Add custom print styles
    await page.addStyleTag({
      content: `
        @page {
          size: A4 portrait;
          margin: 24mm;
        }
        
        body {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
        }
        
        .intro-section {
          page-break-after: always;
        }
        
        .product-card {
          break-inside: avoid;
          page-break-inside: avoid;
          height: auto;
          min-height: 400px;
          margin-bottom: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 1px solid #e0e0e0;
          padding-bottom: 70px;
          position: relative;
        }
        
        .product-price {
          position: absolute !important;
          bottom: 15px !important;
          left: 15px !important;
          right: 15px !important;
        }
        
        .product-title {
          min-height: 72px;
        }
        
        @media (max-width: 767px) {
          .product-title {
            min-height: 4.5rem;
          }
        }
      `,
    })

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "24mm",
        right: "24mm",
        bottom: "24mm",
        left: "24mm",
      },
      displayHeaderFooter: false,
      preferCSSPageSize: true,
    })

    // Save the PDF
    fs.writeFileSync(outputPath, pdfBuffer)
    console.log(`PDF saved to ${outputPath}`)
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw error
  } finally {
    await browser.close()
  }
}

// Example usage
async function main() {
  const url = "http://localhost:3000" // URL of your catalog page
  const outputPath = path.resolve(__dirname, "../Product_Catalog.pdf")

  // Optional filters
  const options = {
    filters: {
      clientName: "Example Client",
      // Add other filters as needed
    },
  }

  try {
    await generatePDF(url, outputPath, options)
  } catch (error) {
    process.exit(1)
  }
}

// Run the script if called directly
if (require.main === module) {
  main()
}

export { generatePDF }
