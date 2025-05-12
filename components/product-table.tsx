"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Download, Loader2, Star } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/types"
import { useMobile } from "@/hooks/use-mobile"

interface ProductTableProps {
  products: Product[]
  loading: boolean
  sortOrder: "asc" | "desc"
  onSortChange: (order: "asc" | "desc") => void
  clientName: string
  onDownloadPDF: () => void
  pdfLoading: boolean
  discount: number
}

export function ProductTable({
  products,
  loading,
  sortOrder,
  onSortChange,
  clientName,
  onDownloadPDF,
  pdfLoading,
  discount,
}: ProductTableProps) {
  const isMobile = useMobile()
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null)

  // Toggle product expansion
  const toggleProductExpansion = (productName: string) => {
    if (expandedProduct === productName) {
      setExpandedProduct(null)
    } else {
      setExpandedProduct(productName)
    }
  }

  // Calculate discounted price
  const calculateDiscountedPrice = (price: string) => {
    const originalPrice = Number.parseFloat(price)
    if (isNaN(originalPrice)) return "0"
    const discountedPrice = originalPrice - (originalPrice * discount) / 100
    return discountedPrice.toFixed(2)
  }

  // Format price with commas
  const formatPrice = (price: string) => {
    const numPrice = Number.parseFloat(price)
    if (isNaN(numPrice)) return "₹0"
    return `₹${numPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-center">
        <div className="text-lg font-medium">No products found</div>
        <div className="text-sm text-muted-foreground">Try adjusting your filters to find products.</div>
      </div>
    )
  }

  return (
    <div className="product-table">
      {/* Client Info for PDF */}
      <div className="client-info mb-4 hidden print:block">
        <h2 className="text-xl font-bold">Product Catalog</h2>
        {clientName && <p className="text-lg">Client: {clientName}</p>}
        <p>Date: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Download PDF Button (Mobile) */}
      <div className="mb-4 flex justify-end md:hidden">
        <Button onClick={onDownloadPDF} disabled={pdfLoading} size="sm" className="no-print">
          {pdfLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          {pdfLoading ? "Generating..." : "Download PDF"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card
            key={`${product.productName}-${product.rate}`}
            className={cn(
              "overflow-hidden transition-all duration-200 hover:shadow-md",
              expandedProduct === product.productName ? "row-span-2" : "",
            )}
          >
            <div className="relative">
              <div className="aspect-video w-full overflow-hidden bg-muted">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.productName}
                  width={600}
                  height={400}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=400&width=600"
                  }}
                />
              </div>

              {/* Ranking Badge */}
              {product.ranking > 0 && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  {product.ranking.toFixed(1)}
                </div>
              )}

              <div className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="font-medium line-clamp-2">{product.productName}</h3>
                  <div className="ml-2 flex flex-col items-end">
                    {discount > 0 ? (
                      <>
                        <span className="text-sm font-medium text-muted-foreground line-through">
                          {formatPrice(product.rate)}
                        </span>
                        <span className="text-base font-bold text-green-600">
                          {formatPrice(calculateDiscountedPrice(product.rate))}
                        </span>
                      </>
                    ) : (
                      <span className="text-base font-bold">{formatPrice(product.rate)}</span>
                    )}
                  </div>
                </div>

                <div className="mb-3 flex flex-wrap gap-1">
                  {product.productCategory && (
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      {product.productCategory}
                    </span>
                  )}
                  {product.theme && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      {product.theme}
                    </span>
                  )}
                  {product.occasion && (
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                      {product.occasion}
                    </span>
                  )}
                </div>

                <div
                  className={cn(
                    "description-container overflow-hidden transition-all duration-300",
                    expandedProduct === product.productName ? "max-h-96" : "max-h-12",
                  )}
                >
                  <div
                    className="text-sm text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleProductExpansion(product.productName)}
                  className="mt-2 h-8 w-full justify-center px-2 text-xs"
                >
                  {expandedProduct === product.productName ? "Show Less" : "Show More"}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {products.length > 0 && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Showing {products.length} {products.length === 1 ? "product" : "products"}
        </div>
      )}
    </div>
  )
}
