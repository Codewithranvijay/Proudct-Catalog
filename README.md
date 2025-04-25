# Product Catalog with PDF Export

This project implements a product catalog with advanced PDF export capabilities.

## Features

- Occasion filter that pulls values from column B in the Google Sheet
- Pixel-perfect PDF generation using Puppeteer
- Proper page flow with a dedicated first page
- Two product cards per A4 portrait page
- Proper rendering of the Indian Rupee symbol
- Responsive design with appropriate product title heights

## Verifying PDF Features

To verify all the PDF features are working correctly:

1. Start the development server:
   \`\`\`
   npm run dev
   \`\`\`

2. In a separate terminal, run the verification script:
   \`\`\`
   npm run verify-pdf
   \`\`\`

3. Check the generated files:
   - `verification_pdf.pdf`: The full PDF with all features
   - `verification_screenshot.png`: A screenshot of the first page

## PDF Generation

The PDF generation process:

1. Uses Puppeteer to capture the page with current filters
2. Embeds Noto Sans font for proper Rupee symbol rendering
3. Applies custom print styles for perfect layout
4. Compresses images larger than 200KB to keep file size under 10MB
5. Ensures exactly 2 product cards per page with proper spacing

## Manual PDF Generation

To manually generate a PDF:

1. Start the development server:
   \`\`\`
   npm run dev
   \`\`\`

2. Navigate to http://localhost:3000 in your browser
3. Apply any desired filters
4. Click the "Download PDF" button

Alternatively, use the command line:

\`\`\`
npm run generate-pdf
\`\`\`

This will generate a PDF with default settings.
