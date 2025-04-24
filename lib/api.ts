import type { Product } from "./types"

// Function to fetch products from our API endpoint
export async function fetchProducts(): Promise<Product[]> {
  try {
    // Add a timestamp to prevent caching issues
    const timestamp = new Date().getTime()
    const response = await fetch(`/api/products?t=${timestamp}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

// Function to convert Google Drive links to direct image URLs
export function convertDriveLink(url: string): string {
  if (!url || typeof url !== "string") {
    return "https://via.placeholder.com/300"
  }

  const match = url.match(/(?:\/d\/|id=)([a-zA-Z0-9_-]+)/)
  if (match) {
    return `https://lh3.googleusercontent.com/d/${match[1]}=s600`
  }

  return url
}

// Function to preload images to avoid loading issues
export function preloadImages(products: Product[]): void {
  if (typeof window === "undefined") return

  products.forEach((product) => {
    if (product.image) {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = product.image
    }
  })
}
