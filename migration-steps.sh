# 1. Clone the current repository
git clone https://github.com/OLD_ACCOUNT/product-catalog.git
cd product-catalog

# 2. Create new repository on new account (via GitHub web interface)

# 3. Update remote origin
git remote set-url origin https://github.com/NEW_ACCOUNT/product-catalog.git

# 4. Push to new repository
git push -u origin main

# 5. Update any hardcoded references in the code
# Check for any account-specific URLs or references
