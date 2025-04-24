/**
 * DEPLOYMENT INSTRUCTIONS
 *
 * This file contains instructions for running the application locally and deploying it to a GoDaddy server.
 */

/**
 * RUNNING LOCALLY
 *
 * 1. Install Node.js (v18 or later) from https://nodejs.org/
 *
 * 2. Clone or download the project to your local machine
 *
 * 3. Open a terminal/command prompt in the project directory
 *
 * 4. Install dependencies:
 *    npm install
 *
 * 5. Create a .env.local file in the root directory with your Google Sheets API key:
 *    (Use the environment variable name for the Google API key as shown in the app/api/products/route.ts file)
 *    Example format: API_KEY_NAME=your_api_key_value_here
 *
 * 6. Start the development server:
 *    npm run dev
 *
 * 7. Open your browser and navigate to:
 *    http://localhost:3000
 */

/**
 * BUILDING FOR PRODUCTION
 *
 * 1. Build the application:
 *    npm run build
 *
 * 2. Test the production build locally:
 *    npm start
 */

/**
 * DEPLOYING TO GODADDY SHARED HOSTING
 *
 * Option 1: Static Export (Recommended for shared hosting)
 *
 * 1. Modify next.config.mjs to enable static exports:
 *
 *    const nextConfig = {
 *      output: 'export',
 *      images: {
 *        unoptimized: true,
 *      },
 *    };
 *
 *    export default nextConfig;
 *
 * 2. Build the static export:
 *    npm run build
 *
 * 3. This will create an "out" directory with static HTML/CSS/JS files
 *
 * 4. Upload the contents of the "out" directory to your GoDaddy hosting using FTP:
 *    - Use an FTP client like FileZilla
 *    - Connect to your GoDaddy server using the FTP credentials from your hosting account
 *    - Navigate to the public_html directory (or the directory where your website files should go)
 *    - Upload all files from the "out" directory
 *
 * 5. Important: Create a .htaccess file in the root directory with the following content:
 *
 *    <IfModule mod_rewrite.c>
 *      RewriteEngine On
 *      RewriteBase /
 *      RewriteRule ^index\.html$ - [L]
 *      RewriteCond %{REQUEST_FILENAME} !-f
 *      RewriteCond %{REQUEST_FILENAME} !-d
 *      RewriteRule . /index.html [L]
 *    </IfModule>
 *
 * 6. For API access in static export:
 *    - Since the Google Sheets API is called from the client in static export, you'll need to:
 *    - Create a file called .env.production with your API key
 *    - Make sure the API key is properly restricted in Google Cloud Console (limit to your domain)
 *    - Consider implementing a proxy service for better security
 *
 * Option 2: Node.js Hosting (If GoDaddy supports Node.js)
 *
 * 1. Check if your GoDaddy hosting plan supports Node.js
 *
 * 2. If supported, follow these steps:
 *    - Build the application: npm run build
 *    - Upload the entire project directory (excluding node_modules)
 *    - Connect to your server via SSH
 *    - Navigate to your project directory
 *    - Run: npm install --production
 *    - Set up a process manager like PM2: npm install -g pm2
 *    - Start your application: pm2 start npm -- start
 *
 * 3. Configure your domain to point to the Node.js server
 *
 * 4. Set up environment variables on your server for API keys and other sensitive data
 *
 * Note: Many shared hosting plans don't support Node.js. In that case, use Option 1.
 */

/**
 * USING A SUBDOMAIN OR SUBDIRECTORY
 *
 * If you want to deploy to a subdomain or subdirectory:
 *
 * 1. For static export, modify next.config.mjs:
 *
 *    const nextConfig = {
 *      output: 'export',
 *      basePath: '/catalog', // If deploying to example.com/catalog
 *      images: {
 *        unoptimized: true,
 *      },
 *    };
 *
 * 2. Build and deploy as described above
 */

/**
 * SECURITY CONSIDERATIONS
 *
 * 1. API Keys:
 *    - Never expose API keys directly in client-side code
 *    - For static exports, use environment variables with proper restrictions
 *    - Consider using a proxy service or serverless functions for API calls
 *
 * 2. Data Protection:
 *    - Ensure your Google Sheet has appropriate sharing settings
 *    - Consider implementing authentication for the catalog if it contains sensitive data
 */

/**
 * TROUBLESHOOTING
 *
 * 1. If images don't load:
 *    - Check that the Google Drive links are accessible
 *    - Verify that CORS is not blocking image loading
 *
 * 2. If the API doesn't work:
 *    - Ensure your API key is correctly set in environment variables
 *    - Check that the spreadsheet ID is correct
 *    - Verify the spreadsheet is accessible with the API key
 *
 * 3. For static export issues:
 *    - Make sure all API calls use getStaticProps or are client-side
 *    - Ensure all dynamic routes are handled properly
 */

export {} // This export is needed to make TypeScript treat this as a module
