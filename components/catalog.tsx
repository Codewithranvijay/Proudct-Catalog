"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Download, X, Loader2 } from "lucide-react"
import Image from "next/image"
import { ProductTable } from "./product-table"
import { PriceFilter } from "./price-filter"
import { MultiSelect } from "./multi-select"
import { fetchProducts, preloadImages } from "@/lib/api"
import type { Product } from "@/lib/types"
import { useMobile } from "@/hooks/use-mobile"
import { generateProductCatalogPDF } from "@/lib/pdf-generator"
import { motion, AnimatePresence } from "framer-motion"

export default function Catalog() {
  const { toast } = useToast()
  const isMobile = useMobile()
  const [loading, setLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [themes, setThemes] = useState<string[]>([])
  const [occasions, setOccasions] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([])
  const [clientName, setClientName] = useState("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [showIntro, setShowIntro] = useState(true)
  const [contentLoaded, setContentLoaded] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const clientInfoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Hide content until intro animation completes
    document.body.style.overflow = "hidden"

    // Show intro animation for 5 seconds
    const timer = setTimeout(() => {
      setShowIntro(false)
      // Allow scrolling after intro animation
      document.body.style.overflow = ""
    }, 5000)

    // Load products after intro animation
    setTimeout(() => {
      loadProducts()
    }, 1000)

    return () => {
      clearTimeout(timer)
      document.body.style.overflow = ""
    }
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, selectedCategories, selectedThemes, selectedOccasions, priceRange, sortOrder])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const data = await fetchProducts()
      setProducts(data)

      // Preload images to avoid loading issues in PDF
      preloadImages(data)

      // Extract unique categories, themes, and occasions
      const uniqueCategories = [...new Set(data.map((p) => p.productCategory).filter(Boolean))]
      const uniqueThemes = [...new Set(data.map((p) => p.theme).filter(Boolean))]
      const uniqueOccasions = [...new Set(data.map((p) => p.occasion).filter(Boolean))]

      setCategories(uniqueCategories)
      setThemes(uniqueThemes)
      setOccasions(uniqueOccasions)
      setFilteredProducts(data)
      setContentLoaded(true)
    } catch (error) {
      console.error("Failed to load products:", error)
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    if (!products.length) return

    let filtered = [...products]

    // Filter by price range
    filtered = filtered.filter((product) => {
      const price = Number.parseFloat(product.rate) || 0
      return price >= priceRange[0] && price <= priceRange[1]
    })

    // Filter by selected categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) => selectedCategories.includes(product.productCategory))
    }

    // Filter by selected themes
    if (selectedThemes.length > 0) {
      filtered = filtered.filter((product) => selectedThemes.includes(product.theme))
    }

    // Filter by selected occasions
    if (selectedOccasions.length > 0) {
      filtered = filtered.filter((product) => selectedOccasions.includes(product.occasion))
    }

    // Sort by price
    filtered.sort((a, b) => {
      const priceA = Number.parseFloat(a.rate) || 0
      const priceB = Number.parseFloat(b.rate) || 0
      return sortOrder === "asc" ? priceA - priceB : priceB - priceA
    })

    // Limit to 30 products for performance
    setFilteredProducts(filtered.slice(0, 30))
  }

  const resetFilters = () => {
    setPriceRange([0, 5000])
    setSelectedCategories([])
    setSelectedThemes([])
    setSelectedOccasions([])
    setSortOrder("asc")
    setClientName("") // Clear client name when resetting filters
  }

  // PDF generation method using client-side approach
  const handleDownloadPDF = async () => {
    if (filteredProducts.length === 0) {
      toast({
        title: "No products to download",
        description: "Please select products before generating a PDF.",
        variant: "destructive",
      })
      return
    }

    setPdfLoading(true)

    try {
      toast({
        title: "Generating PDF",
        description: "Please wait while we create your PDF...",
      })

      // Generate the PDF using our utility
      const pdfBlob = await generateProductCatalogPDF(
        filteredProducts,
        clientName,
        selectedCategories,
        selectedThemes,
        selectedOccasions,
        priceRange,
      )

      // Create a URL for the blob
      const url = URL.createObjectURL(pdfBlob)

      // Create a link element
      const link = document.createElement("a")
      link.href = url
      link.download = `${clientName || "Product"}_Catalog_${new Date().getTime()}.pdf`

      // Append the link to the body
      document.body.appendChild(link)

      // Click the link to download the file
      link.click()

      // Clean up
      URL.revokeObjectURL(url)
      document.body.removeChild(link)

      toast({
        title: "PDF Generated",
        description: "Your catalog has been downloaded successfully.",
      })
    } catch (error) {
      console.error("PDF generation error:", error)
      toast({
        title: "PDF Generation Failed",
        description: "There was an error generating your PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setPdfLoading(false)
    }
  }

  const areFiltersActive = () => {
    return (
      selectedCategories.length > 0 ||
      selectedThemes.length > 0 ||
      selectedOccasions.length > 0 ||
      priceRange[0] !== 0 ||
      priceRange[1] !== 5000
    )
  }

  return (
    <>
      {/* Intro Animation */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-white"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{
                scale: [0.2, 1, 1.5, 2.0],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 5,
                times: [0, 0.3, 0.7, 1],
              }}
            >
              <Image
                src="https://lh3.googleusercontent.com/d/1pMIJ-KTCUVcIAinU7A88PUG550hBGia-"
                alt="Company Logo"
                width={300}
                height={200}
                className="object-contain"
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=200&width=300"
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn("min-h-screen bg-background", !contentLoaded && "opacity-0")} ref={contentRef}>
        <header className="sticky top-0 z-10 border-b bg-background print-header" ref={headerRef}>
          <div className="container flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-36">
                <Image
                  src="https://lh3.googleusercontent.com/d/1pMIJ-KTCUVcIAinU7A88PUG550hBGia-"
                  alt="Company Logo"
                  fill
                  className="object-contain"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=48&width=144"
                  }}
                />
              </div>
              <h1 className="text-xl font-bold text-primary md:text-2xl">Product Catalog</h1>
            </div>
            <Button
              onClick={handleDownloadPDF}
              disabled={pdfLoading || filteredProducts.length === 0}
              className="gap-2 no-print"
            >
              {pdfLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              <span className={cn(isMobile ? "sr-only" : "")}>{pdfLoading ? "Generating..." : "Download PDF"}</span>
            </Button>
          </div>
        </header>

        <main className="container py-6">
          <section className="intro">
            <Card className="mb-6 p-4 md:p-6 client-info-card intro-section" ref={clientInfoRef}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-primary">Client Name</label>
                  <Input
                    placeholder="Enter Client Name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-primary">Product Category</label>
                  <MultiSelect
                    options={categories.map((cat) => ({ label: cat, value: cat }))}
                    selected={selectedCategories}
                    onChange={setSelectedCategories}
                    placeholder="Select categories..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-primary">Price Range</label>
                  <div className="rounded-md border bg-muted/40 p-2 text-sm">
                    ₹{priceRange[0]} - ₹{priceRange[1]}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-primary">Theme</label>
                  <MultiSelect
                    options={themes.map((theme) => ({ label: theme, value: theme }))}
                    selected={selectedThemes}
                    onChange={setSelectedThemes}
                    placeholder="Select themes..."
                  />
                </div>

                <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-4">
                  <label className="text-sm font-medium text-primary">Occasion</label>
                  <MultiSelect
                    id="occasion-filter"
                    className="searchable-dropdown"
                    options={occasions.map((occasion) => ({ label: occasion, value: occasion }))}
                    selected={selectedOccasions}
                    onChange={setSelectedOccasions}
                    placeholder="Select occasions..."
                  />
                </div>
              </div>
            </Card>
          </section>

          <div className="no-print filter-controls">
            <PriceFilter value={priceRange} onChange={setPriceRange} onReset={resetFilters} />

            {areFiltersActive() && (
              <div className="mb-6 flex items-center justify-between rounded-lg border bg-background p-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Showing products with price range:</span>
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    ₹{priceRange[0]} - ₹{priceRange[1]}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={resetFilters} className="text-sm">
                  <X className="mr-1 h-3 w-3" />
                  Clear
                </Button>
              </div>
            )}
          </div>

          <ProductTable
            products={filteredProducts}
            loading={loading}
            sortOrder={sortOrder}
            onSortChange={(order) => setSortOrder(order)}
            clientName={clientName}
            onDownloadPDF={handleDownloadPDF}
            pdfLoading={pdfLoading}
          />
        </main>

        <footer className="border-t py-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Product Catalog. All products subject to availability.</p>
        </footer>
      </div>
    </>
  )
}
