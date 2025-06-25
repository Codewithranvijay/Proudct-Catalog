"use client"
import type { Product } from "@/lib/types"
import { Maximize2, Download, Loader2 } from "lucide-react"
import { useState } from "react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

interface ProductTableProps {
  products: Product[]
  loading: boolean
  sortOrder: "asc" | "desc"
  onSortChange: (order: "asc" | "desc") => void
  clientName?: string
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
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null)
  const isMobile = useMobile()

  const toggleSort = () => {
    onSortChange(sortOrder === "asc" ? "desc" : "asc")
  }

  // Function to calculate discounted price
  const calculateDiscountedPrice = (price: string): { original: number; discounted: number | null } => {
    const originalPrice = Number.parseFloat(price) || 0
    if (discount <= 0) return { original: originalPrice, discounted: null }

    const discountAmount = originalPrice * (discount / 100)
    const discountedPrice = originalPrice - discountAmount
    return { original: originalPrice, discounted: discountedPrice }
  }

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex h-60 flex-col items-center justify-center gap-4 rounded-lg border bg-muted/20 p-4 md:p-8 text-center">
        <div className="text-base md:text-lg font-medium">No products found</div>
        <p className="text-xs md:text-sm text-muted-foreground">Try adjusting your filters to see more products.</p>
      </div>
    )
  }

  // Card-based layout for all screen sizes
  return (
    <div className="space-y-4 md:space-y-6 pb-4 md:pb-6">
      <div className="intro-section">
        <div className="pdf-client-info">
          {clientName && <p className="font-medium">Client: {clientName}</p>}
          <p>Date: {new Date().toLocaleDateString()}</p>
        </div>

        {/* PDF download button */}
        <div className="mb-2 md:mb-4 flex justify-end">
          <Button onClick={onDownloadPDF} disabled={pdfLoading} size="sm" className="gap-2 h-8 px-2 md:h-9 md:px-3">
            {pdfLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            <span className="hidden md:inline">{pdfLoading ? "Generating..." : "Download PDF"}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {products.map((product, index) => {
          const priceInfo = calculateDiscountedPrice(product.rate)

          return (
            <div key={index} className="rounded-lg border bg-card shadow product-card">
              <div className="p-3 md:p-4">
                <h3 className="text-base md:text-lg font-semibold product-title">{product.productName || "N/A"}</h3>

                <div className="text-xs md:text-sm text-muted-foreground product-meta">
                  <span className="font-medium">Category:</span> {product.productCategory || "N/A"}
                  <span className="mx-1 md:mx-2">•</span>
                  <span className="font-medium">Theme:</span> {product.theme || "N/A"}
                  {product.occasion && (
                    <>
                      <span className="mx-1 md:mx-2">•</span>
                      <span className="font-medium">Occasion:</span> {product.occasion}
                    </>
                  )}
                </div>

                <div className="flex justify-center my-2 md:my-3 product-image">
                  <div className="relative group w-full">
                    <img
                      src={product.image || "/placeholder.svg?height=200&width=300"}
                      alt={product.productName || "Product"}
                      className="h-[150px] md:h-[180px] w-full rounded-md border bg-background p-2 object-contain transition-transform hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=200&width=300"
                      }}
                      crossOrigin="anonymous"
                    />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute bottom-2 right-2 h-6 w-6 md:h-8 md:w-8 rounded-full bg-white/90 opacity-70 group-hover:opacity-100 transition-opacity no-print"
                        >
                          <Maximize2 className="h-3 w-3 md:h-4 md:w-4" />
                          <span className="sr-only">Enlarge image</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogTitle>{product.productName || "Product Image"}</DialogTitle>
                        <div className="flex justify-center p-4">
                          <img
                            src={product.image || "/placeholder.svg?height=600&width=600"}
                            alt={product.productName || "Product"}
                            className="max-h-[70vh] object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg?height=600&width=600"
                            }}
                            crossOrigin="anonymous"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="mb-3 product-description-container">
                  <h4 className="font-medium mb-1 text-xs md:text-sm">Description:</h4>
                  <div
                    className="prose-sm product-description text-xs md:text-sm"
                    dangerouslySetInnerHTML={{ __html: product.description || "No description available" }}
                  />
                </div>

                <div
                  className={cn(
                    "rounded-md border border-amber-200 bg-amber-50 px-2 py-1 md:px-3 md:py-2 text-center font-medium product-price",
                    "transition-transform hover:scale-105 price-cell",
                    priceInfo.discounted ? "discount-applied" : "",
                  )}
                >
                  {priceInfo.discounted ? (
                    <>
                      <div className="flex items-center justify-center gap-1 md:gap-2">
                        <span className="line-through text-gray-500 text-xs md:text-sm">
                          ₹{priceInfo.original.toFixed(2)}
                        </span>
                        <span className="text-green-600 text-xs md:text-sm">₹{priceInfo.discounted.toFixed(2)}</span>
                      </div>
                      <span className="block text-[10px] md:text-xs text-green-600">
                        {discount}% Discount Applied + GST
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs md:text-sm">₹{priceInfo.original.toFixed(2)}</span>
                      <span className="block text-[10px] md:text-xs text-muted-foreground">+ GST</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
