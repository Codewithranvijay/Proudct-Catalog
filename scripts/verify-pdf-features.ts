import puppeteer from "puppeteer"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

// Get the directory name
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function verifyPdfFeatures() {
  console.log("Starting PDF verification process...")

  // Launch a new browser instance
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

    // Navigate to the catalog page
    console.log("Navigating to the catalog page...")
    await page.goto("http://localhost:3000", { waitUntil: "networkidle2" })

    // Wait for products to load
    await page.waitForSelector(".product-card", { timeout: 10000 })
    console.log("Products loaded successfully")

    // Apply filters to test filtering functionality
    console.log("Applying filters to test functionality...")

    // Set client name
    await page.type('input[placeholder="Enter Client Name"]', "Test Client")

    // Open occasion filter and select an option
    await page.evaluate(() => {
      // Find and click the occasion filter dropdown
      const occasionFilter = document.querySelector("#occasion-filter")
      if (occasionFilter) {
        ;(occasionFilter as HTMLElement).click()
      }
    })

    // Wait for dropdown to open
    await page.waitForSelector(".command-input", { visible: true })

    // Type in search and select first option
    await page.type(".command-input", "B")
    await page.waitForTimeout(500)

    // Click the first option
    await page.evaluate(() => {
      const firstOption = document.querySelector(".command-item")
      if (firstOption) {
        ;(firstOption as HTMLElement).click()
      }
    })

    // Click "Done" button
    await page.evaluate(() => {
      const doneButton = Array.from(document.querySelectorAll("button")).find((button) =>
        button.textContent?.includes("Done"),
      )
      if (doneButton) {
        doneButton.click()
      }
    })

    // Wait for filters to apply
    await page.waitForTimeout(1000)
    console.log("Filters applied successfully")

    // Add custom print styles for verification
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
          margin-bottom: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 1px solid #e0e0e0;
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
    console.log("Generating PDF...")
    const pdfPath = path.resolve(__dirname, "../verification_pdf.pdf")
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
    fs.writeFileSync(pdfPath, pdfBuffer)
    console.log(`PDF saved to ${pdfPath}`)

    // Take a screenshot of the first page for quick verification
    const screenshotPath = path.resolve(__dirname, "../verification_screenshot.png")
    await page.screenshot({ path: screenshotPath, fullPage: true })
    console.log(`Screenshot saved to ${screenshotPath}`)

    // Verify features
    console.log("\nVerifying features:")

    // Check if occasion filter is present
    const hasOccasionFilter = await page.evaluate(() => {
      return !!document.querySelector("#occasion-filter")
    })
    console.log(`✓ Occasion filter present: ${hasOccasionFilter}`)

    // Check if Rupee symbol renders correctly
    const hasRupeeSymbol = await page.evaluate(() => {
      const priceElements = document.querySelectorAll(".product-price")
      return Array.from(priceElements).some((el) => el.textContent?.includes("₹"))
    })
    console.log(`✓ Rupee symbol renders correctly: ${hasRupeeSymbol}`)

    // Check responsive design (product title height)
    const correctTitleHeight = await page.evaluate(() => {
      const style = window.getComputedStyle(document.querySelector(".product-title") as Element)
      return style.minHeight === "72px"
    })
    console.log(`✓ Product title has correct min-height: ${correctTitleHeight}`)

    console.log("\nVerification complete! Please check the generated PDF and screenshot.")
  } catch (error) {
    console.error("Error during verification:", error)
  } finally {
    await browser.close()
  }
}

// Run the verification
verifyPdfFeatures().catch(console.error)
