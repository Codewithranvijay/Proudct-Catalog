"use client"

/**
 * PRODUCT CATALOG CUSTOMIZATION GUIDE
 *
 * This file provides a comprehensive guide on how to customize different aspects of the Product Catalog application.
 */

/**
 * FILE STRUCTURE AND CUSTOMIZATION POINTS
 *
 * 1. MAIN COMPONENTS
 *
 * components/catalog.tsx
 *   - Main container component
 *   - Controls the overall layout
 *   - Manages state for products, filters, and PDF generation
 *   - Contains the intro animation
 *   - To customize:
 *     - Modify the intro animation duration in useEffect (currently set to 5000ms)
 *     - Change the layout structure in the return statement
 *     - Adjust the PDF generation logic in handleDownloadPDF function
 *
 * components/product-table.tsx
 *   - Displays products in table or card format
 *   - Handles both desktop and mobile views
 *   - To customize:
 *     - Modify the desktop table layout (columns, widths, etc.)
 *     - Change the mobile card layout
 *     - Adjust image sizes and styling
 *
 * components/price-filter.tsx
 *   - Price range filter component
 *   - To customize:
 *     - Modify price ranges in priceChips array
 *     - Change slider behavior or appearance
 *
 * components/multi-select.tsx
 *   - Dropdown selection component for categories and themes
 *   - To customize:
 *     - Change dropdown appearance
 *     - Modify selection behavior
 *
 * 2. API AND DATA
 *
 * lib/api.ts
 *   - Contains functions for fetching data
 *   - Handles Google Drive image URL conversion
 *   - To customize:
 *     - Modify fetchProducts function to change data source
 *     - Adjust convertDriveLink function for different image sources
 *
 * app/api/products/route.ts
 *   - Server-side API endpoint
 *   - Fetches data from Google Sheets
 *   - To customize:
 *     - Change spreadsheetId or sheetName to use different data source
 *     - Modify data processing logic
 *     - Add authentication or rate limiting
 *
 * 3. STYLING
 *
 * app/globals.css
 *   - Contains global styles and CSS variables
 *   - Includes responsive and print styles
 *   - To customize:
 *     - Modify CSS variables in :root for color scheme changes
 *     - Adjust responsive breakpoints in media queries
 *     - Change print styles for PDF generation
 *
 * tailwind.config.ts
 *   - Tailwind CSS configuration
 *   - To customize:
 *     - Add custom colors or extend existing ones
 *     - Modify breakpoints for responsive design
 */

/**
 * COMMON CUSTOMIZATIONS
 *
 * 1. CHANGING THE LOGO
 *
 * In components/catalog.tsx:
 * - Find the Image component with the logo
 * - Replace the src attribute with your logo URL
 * - Adjust width and height as needed
 *
 * 2. MODIFYING COLOR SCHEME
 *
 * In app/globals.css:
 * - Update the CSS variables in :root
 * - Primary color is used for headers, buttons, and accents
 * - Background and foreground colors control the overall theme
 *
 * 3. CHANGING PRICE RANGES
 *
 * In components/price-filter.tsx:
 * - Modify the priceChips array to change available price ranges
 * - Adjust the slider max value if needed (currently 5000)
 *
 * 4. ADJUSTING INTRO ANIMATION
 *
 * In components/catalog.tsx:
 * - Find the useEffect with the timer for showIntro
 * - Change the timeout duration (currently 5000ms)
 * - Modify the motion.div animation properties for different effects
 *
 * 5. CHANGING TABLE COLUMNS
 *
 * In components/product-table.tsx:
 * - Modify the TableHeader section to add, remove, or rename columns
 * - Adjust column widths using the className prop (w-[12%], etc.)
 * - Update the corresponding TableCell components in the TableBody
 */

/**
 * DEPLOYMENT CONSIDERATIONS
 *
 * 1. ENVIRONMENT VARIABLES
 *
 * - The Google Sheets API key is currently hardcoded in app/api/products/route.ts
 * - For production, move this to an environment variable:
 *   - Create a .env.local file with GOOGLE_API_KEY=your_key_here
 *   - Replace the hardcoded key with process.env.GOOGLE_API_KEY
 *
 * 2. IMAGE LOADING
 *
 * - If images don't load properly:
 *   - Check that Google Drive sharing permissions are set correctly
 *   - Verify the convertDriveLink function in lib/api.ts is working
 *   - Consider using a different image hosting service
 *
 * 3. PERFORMANCE OPTIMIZATION
 *
 * - The app currently limits to 30 products for performance
 * - For larger catalogs:
 *   - Implement pagination in the API and UI
 *   - Add server-side filtering to reduce data transfer
 *   - Consider using a database instead of Google Sheets
 *
 * 4. MOBILE RESPONSIVENESS
 *
 * - Test thoroughly on various devices
 * - Adjust breakpoints in tailwind.config.ts if needed
 * - Modify the mobile card layout in product-table.tsx
 */

/**
 * TROUBLESHOOTING
 *
 * 1. IMAGES NOT LOADING
 *
 * - Check browser console for CORS errors
 * - Verify Google Drive sharing settings
 * - Try using the preloadImages function in lib/api.ts
 * - Add error handling to image elements
 *
 * 2. PDF GENERATION ISSUES
 *
 * - PDF generation uses html2canvas and jsPDF
 * - Common issues:
 *   - Images not appearing: Check CORS settings
 *   - Text cut off: Adjust margins or font sizes
 *   - Layout problems: Modify the PDF generation logic
 *
 * 3. PERFORMANCE PROBLEMS
 *
 * - If the app is slow:
 *   - Reduce the number of products displayed
 *   - Optimize image sizes
 *   - Implement virtualization for long lists
 *   - Add pagination
 *
 * 4. API ERRORS
 *
 * - Check Google Sheets API quota limits
 * - Verify API key restrictions
 * - Add better error handling in fetchProducts function
 */

export {} // This export is needed to make TypeScript treat this as a module
