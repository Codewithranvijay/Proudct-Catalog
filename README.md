# Product Catalog with Login System

This project implements a product catalog with a login system that authenticates against a Google Sheet.

## Features

- Login system with email and password authentication
- Credentials verification against a Google Sheet
- Login attempt logging
- Session management with cookies
- Protected routes with middleware
- Product catalog with filtering and search
- PDF export functionality
- Responsive design

## Google Sheet Setup

The application requires a Google Sheet with the following tabs:

1. **login** tab:
   - Column A: Email addresses
   - Column B: Passwords

2. **log** tab (for logging login attempts):
   - Column A: Timestamp
   - Column B: Email
   - Column C: Status (Success/Failed)
   - Column D: Message
   - Column E: IP Address

3. **STANDARD** tab (for product data):
   - Contains product information as per the existing implementation

## Running the Application

1. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

2. Start the development server:
   \`\`\`
   npm run dev
   \`\`\`

3. Open your browser and navigate to:
   \`\`\`
   http://localhost:3000
   \`\`\`

4. You will be redirected to the login page. Enter credentials that match those in the "login" tab of your Google Sheet.

## Authentication Flow

1. User enters email and password on the login page
2. Credentials are verified against the "login" tab in the Google Sheet
3. Login attempt is logged in the "log" tab
4. On successful login, a session cookie is set
5. User is redirected to the product catalog
6. The middleware protects routes from unauthorized access

## Customization

- Update the spreadsheet ID in the API routes to match your Google Sheet
- Modify the login page design as needed
- Adjust the session expiration time in the login API route
