"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Download, X, Loader2, Percent, Filter, SlidersHorizontal, ArrowDownAZ, ArrowUpZA } from "lucide-react"
import Image from "next/image"
import { ProductTable } from "./product-table"
import { PriceFilter } from "./price-filter"
import { MultiSelect } from "./multi-select"
import { fetchProducts, preloadImages } from "@/lib/api"
import type { Product } from "@/lib/types"
import { useMobile } from "@/hooks/use-mobile"
import { generateProductCatalogPDF } from "@/lib/pdf-generator"
import { motion, AnimatePresence } from "framer-motion"
import { UserMenu } from "./user-menu"
import { LoginHistory } from "./login-history"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Slider } from "@/components/ui/slider"

interface CatalogProps {
  userEmail: string
  isAdmin: boolean
}

type SortType = "rank" | "price"
type SortOrder = "asc" | "desc"

export default function Catalog({ userEmail, isAdmin }: CatalogProps) {
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
  const [selectedProductNames, setSelectedProductNames] = useState<string[]>([])
  const [discount, setDiscount] = useState(0)
  const [clientName, setClientName] = useState("")
  const [sortType, setSortType] = useState<SortType>("rank") // Default to rank sorting
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc") // Default to highest first for ranking
  const [showIntro, setShowIntro] = useState(true)
  const [contentLoaded, setContentLoaded] = useState(false)
  const [productNames, setProductNames] = useState<string[]>([])
  const [useAccordionFilters, setUseAccordionFilters] = useState(true)
  const contentRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const clientInfoRef = useRef<HTMLDivElement>(null)
  const [customTypes, setCustomTypes] = useState<string[]>([])
  const [selectedCustomTypes, setSelectedCustomTypes] = useState<string[]>([])

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
  }, [
    products,
    selectedCategories,
    selectedThemes,
    selectedOccasions,
    selectedProductNames,
    selectedCustomTypes,
    priceRange,
    sortType,
    sortOrder,
  ])

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
      const uniqueProductNames = [...new Set(data.map((p) => p.productName).filter(Boolean))]
      const uniqueCustomTypes = [...new Set(data.map((p) => p.customType).filter(Boolean))]

      setCategories(uniqueCategories)
      setThemes(uniqueThemes)
      setOccasions(uniqueOccasions)
      setProductNames(uniqueProductNames)
      setCustomTypes(uniqueCustomTypes)
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

    // Filter by selected product names
    if (selectedProductNames.length > 0) {
      filtered = filtered.filter((product) =>
        selectedProductNames.some((name) => product.productName.toLowerCase().includes(name.toLowerCase())),
      )
    }

    // Filter by selected custom types
    if (selectedCustomTypes.length > 0) {
      filtered = filtered.filter((product) => selectedCustomTypes.includes(product.customType))
    }

    // Sort by selected sort type and order
    if (sortType === "rank") {
      filtered.sort((a, b) => {
        const rankA = a.ranking || 0
        const rankB = b.ranking || 0
        return sortOrder === "desc" ? rankB - rankA : rankA - rankB
      })
    } else {
      // Sort by price
      filtered.sort((a, b) => {
        const priceA = Number.parseFloat(a.rate) || 0
        const priceB = Number.parseFloat(b.rate) || 0
        return sortOrder === "asc" ? priceA - priceB : priceB - priceA
      })
    }

    // Limit to 30 products for performance
    setFilteredProducts(filtered.slice(0, 30))
  }

  const resetFilters = () => {
    setPriceRange([0, 5000])
    setSelectedCategories([])
    setSelectedThemes([])
    setSelectedOccasions([])
    setSelectedProductNames([])
    setSelectedCustomTypes([])
    setDiscount(0)
    setSortType("rank")
    setSortOrder("desc")
    setClientName("") // Clear client name when resetting filters
  }

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
  }

  // Toggle sort type
  const toggleSortType = () => {
    if (sortType === "rank") {
      setSortType("price")
      setSortOrder("asc") // Default to low to high for price
    } else {
      setSortType("rank")
      setSortOrder("desc") // Default to high to low for ranking
    }
  }

  // Handle discount input change
  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value, 10)
    if (isNaN(value)) {
      setDiscount(0)
    } else {
      // Limit discount to 0-30 range
      setDiscount(Math.min(30, Math.max(0, value)))
    }
  }

  // Handle slider change
  const handleSliderChange = (newValue: number[]) => {
    setPriceRange([newValue[0], newValue[1]])
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
        discount,
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
      selectedProductNames.length > 0 ||
      selectedCustomTypes.length > 0 ||
      discount > 0 ||
      priceRange[0] !== 0 ||
      priceRange[1] !== 5000
    )
  }

  // Price chip options
  const priceChips = [
    { label: "All Prices", min: 0, max: 5000 },
    { label: "Under ₹250", min: 0, max: 250 },
    { label: "₹250 - ₹500", min: 250, max: 500 },
    { label: "₹500 - ₹1500", min: 500, max: 1500 },
    { label: "₹1500 - ₹3000", min: 1500, max: 3000 },
    { label: "₹3000 - ₹5000", min: 3000, max: 5000 },
  ]

  const isChipActive = (chip: { min: number; max: number }) => {
    return priceRange[0] === chip.min && priceRange[1] === chip.max
  }

  // Get sort button text based on current sort settings
  const getSortButtonText = () => {
    if (sortType === "price") {
      return sortOrder === "asc" ? "Price: Low to High" : "Price: High to Low"
    }
    return "" // No text for ranking sort (hidden from users)
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
          <div className="container flex items-center justify-between py-2 md:py-4">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="relative h-10 w-28 md:h-12 md:w-36 group">
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
                <div className="absolute -bottom-10 left-0 z-50 hidden w-auto min-w-max rounded-md bg-white p-2 text-xs shadow-md group-hover:block">
                  Logged in as: {userEmail}
                </div>
              </div>
              <h1 className="text-lg font-bold text-primary md:text-2xl">Product Catalog</h1>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 md:h-9 md:px-3"
                  onClick={() => (window.location.href = "/admin")}
                >
                  <span className="hidden md:inline">Admin Dashboard</span>
                  <span className="md:hidden">Admin</span>
                </Button>
              )}
              <LoginHistory />
              <UserMenu email={userEmail} isAdmin={isAdmin} />
              <Button
                onClick={handleDownloadPDF}
                disabled={pdfLoading || filteredProducts.length === 0}
                className="h-8 px-2 md:h-9 md:px-3 no-print"
                size="sm"
              >
                {pdfLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                <span className="hidden md:ml-2 md:inline">{pdfLoading ? "Generating..." : "Download PDF"}</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="container py-3 md:py-6">
          {/* Mobile Filter Options */}
          <div className="md:hidden mb-4 flex gap-2">
            <Button
              variant="outline"
              className="flex-1 justify-between items-center"
              onClick={() => setUseAccordionFilters(!useAccordionFilters)}
            >
              <div className="flex items-center">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <span>Filter Style</span>
              </div>
              {useAccordionFilters ? (
                <span className="text-xs">Accordion</span>
              ) : (
                <span className="text-xs">Expanded</span>
              )}
            </Button>

            {/* Mobile Sort Button - Only show for price sorting */}
            {sortType === "price" && (
              <Button
                variant="outline"
                className="flex items-center gap-1"
                onClick={toggleSortOrder}
                aria-label={sortOrder === "asc" ? "Sort price high to low" : "Sort price low to high"}
              >
                {sortOrder === "asc" ? (
                  <>
                    <ArrowUpZA className="h-4 w-4" />
                    <span className="sr-only md:not-sr-only md:inline-block text-xs">Low to High</span>
                  </>
                ) : (
                  <>
                    <ArrowDownAZ className="h-4 w-4" />
                    <span className="sr-only md:not-sr-only md:inline-block text-xs">High to Low</span>
                  </>
                )}
              </Button>
            )}

            {/* Toggle between rank and price sorting */}
            <Button variant="outline" className="flex items-center gap-1" onClick={toggleSortType}>
              <span className="text-xs">{sortType === "rank" ? "Price Sort" : "Default Sort"}</span>
            </Button>
          </div>

          {/* Mobile Price Filter */}
          <div className="md:hidden mb-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-primary">
                  <Filter className="h-5 w-5" />
                  <h3 className="font-medium">Price Filter</h3>
                </div>
                <Button variant="outline" size="sm" onClick={resetFilters} className="h-8 px-3 text-xs">
                  <X className="mr-1 h-3 w-3" />
                  Reset
                </Button>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {priceChips.map((chip) => (
                  <Button
                    key={chip.label}
                    variant={isChipActive(chip) ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPriceRange([chip.min, chip.max])}
                    className={cn("rounded-full", isChipActive(chip) ? "bg-primary text-primary-foreground" : "")}
                  >
                    {chip.label}
                  </Button>
                ))}
              </div>

              <div className="mb-2 flex justify-between">
                <span className="font-medium">₹{priceRange[0]}</span>
                <span className="font-medium">₹{priceRange[1]}</span>
              </div>

              <Slider
                defaultValue={[0, 5000]}
                value={[priceRange[0], priceRange[1]]}
                max={5000}
                step={50}
                onValueChange={handleSliderChange}
                className="mb-6"
              />

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Min Price</label>
                  <Input
                    type="number"
                    min={0}
                    max={5000}
                    value={priceRange[0]}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value)
                      if (!isNaN(value)) {
                        setPriceRange([Math.max(0, Math.min(value, priceRange[1])), priceRange[1]])
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Price</label>
                  <Input
                    type="number"
                    min={0}
                    max={5000}
                    value={priceRange[1]}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value)
                      if (!isNaN(value)) {
                        setPriceRange([priceRange[0], Math.max(priceRange[0], Math.min(value, 5000))])
                      }
                    }}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Mobile Accordion Filters */}
          <div className="md:hidden mb-4">
            <Card className="p-3">
              {useAccordionFilters ? (
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="client-name">
                    <AccordionTrigger className="text-sm py-2">Client Name</AccordionTrigger>
                    <AccordionContent>
                      <Input
                        placeholder="Enter Client Name"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="category">
                    <AccordionTrigger className="text-sm py-2">Product Category</AccordionTrigger>
                    <AccordionContent>
                      <div className="z-50">
                        <MultiSelect
                          options={categories.map((cat) => ({ label: cat, value: cat }))}
                          selected={selectedCategories}
                          onChange={setSelectedCategories}
                          placeholder="Select categories..."
                          id="mobile-category-select"
                          className="w-full"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="theme">
                    <AccordionTrigger className="text-sm py-2">Theme</AccordionTrigger>
                    <AccordionContent>
                      <div className="z-40">
                        <MultiSelect
                          options={themes.map((theme) => ({ label: theme, value: theme }))}
                          selected={selectedThemes}
                          onChange={setSelectedThemes}
                          placeholder="Select themes..."
                          id="mobile-theme-select"
                          className="w-full"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="occasion">
                    <AccordionTrigger className="text-sm py-2">Occasion</AccordionTrigger>
                    <AccordionContent>
                      <div className="z-30">
                        <MultiSelect
                          options={occasions.map((occasion) => ({ label: occasion, value: occasion }))}
                          selected={selectedOccasions}
                          onChange={setSelectedOccasions}
                          placeholder="Select occasions..."
                          id="mobile-occasion-select"
                          className="w-full"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="product-name">
                    <AccordionTrigger className="text-sm py-2">Product Name</AccordionTrigger>
                    <AccordionContent>
                      <div className="z-20">
                        <MultiSelect
                          options={productNames.map((name) => ({ label: name, value: name }))}
                          selected={selectedProductNames}
                          onChange={setSelectedProductNames}
                          placeholder="Select product names..."
                          id="mobile-product-select"
                          className="w-full"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="discount">
                    <AccordionTrigger className="text-sm py-2">Discount (%)</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex items-center gap-4">
                        <Input
                          type="number"
                          min={0}
                          max={30}
                          value={discount}
                          onChange={handleDiscountChange}
                          className="w-full"
                          placeholder="Enter discount percentage (0-30)"
                        />
                        <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-background">
                          <Percent className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="custom-type">
                    <AccordionTrigger className="text-sm py-2">Custom</AccordionTrigger>
                    <AccordionContent>
                      <div className="z-10">
                        <MultiSelect
                          options={customTypes.map((type) => ({ label: type, value: type }))}
                          selected={selectedCustomTypes}
                          onChange={setSelectedCustomTypes}
                          placeholder="Select custom types..."
                          id="mobile-custom-select"
                          className="w-full"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ) : (
                <div className="space-y-4">
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
                      id="mobile-category-select-expanded"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-primary">Theme</label>
                    <MultiSelect
                      options={themes.map((theme) => ({ label: theme, value: theme }))}
                      selected={selectedThemes}
                      onChange={setSelectedThemes}
                      placeholder="Select themes..."
                      id="mobile-theme-select-expanded"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-primary">Occasion</label>
                    <MultiSelect
                      options={occasions.map((occasion) => ({ label: occasion, value: occasion }))}
                      selected={selectedOccasions}
                      onChange={setSelectedOccasions}
                      placeholder="Select occasions..."
                      id="mobile-occasion-select-expanded"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-primary">Product Name</label>
                    <MultiSelect
                      options={productNames.map((name) => ({ label: name, value: name }))}
                      selected={selectedProductNames}
                      onChange={setSelectedProductNames}
                      placeholder="Select product names..."
                      id="mobile-product-select-expanded"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-primary">Discount (%)</label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        min={0}
                        max={30}
                        value={discount}
                        onChange={handleDiscountChange}
                        className="w-full"
                        placeholder="Enter discount percentage (0-30)"
                      />
                      <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-background">
                        <Percent className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-primary">Custom</label>
                    <MultiSelect
                      options={customTypes.map((type) => ({ label: type, value: type }))}
                      selected={selectedCustomTypes}
                      onChange={setSelectedCustomTypes}
                      placeholder="Select custom types..."
                      id="mobile-custom-select-expanded"
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {areFiltersActive() && (
                <div className="mt-4 flex items-center justify-between rounded-lg border bg-background p-2 shadow-sm">
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-xs text-muted-foreground">Active filters</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={resetFilters} className="h-7 px-2 text-xs">
                    <X className="mr-1 h-3 w-3" />
                    Clear
                  </Button>
                </div>
              )}
            </Card>
          </div>

          <section className="intro">
            <Card className="mb-4 p-3 md:p-6 client-info-card intro-section hidden md:block" ref={clientInfoRef}>
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

                <div className="space-y-2 col-span-1 md:col-span-2">
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

                {/* Product Name Multi-Select */}
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-sm font-medium text-primary">Product Name</label>
                  <MultiSelect
                    options={productNames.map((name) => ({ label: name, value: name }))}
                    selected={selectedProductNames}
                    onChange={setSelectedProductNames}
                    placeholder="Select product names..."
                  />
                </div>

                {/* Custom Filter */}
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-sm font-medium text-primary">Custom</label>
                  <MultiSelect
                    options={customTypes.map((type) => ({ label: type, value: type }))}
                    selected={selectedCustomTypes}
                    onChange={setSelectedCustomTypes}
                    placeholder="Select custom types..."
                  />
                </div>

                {/* Discount Input Box and Sort Toggle */}
                <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-3">
                  <label className="text-sm font-medium text-primary">Discount (%)</label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      min={0}
                      max={30}
                      value={discount}
                      onChange={handleDiscountChange}
                      className="w-full"
                      placeholder="Enter discount percentage (0-30)"
                    />
                    <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-background">
                      <Percent className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                {/* Sort Toggle Button */}
                <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-1">
                  <label className="text-sm font-medium text-primary">Sort By</label>
                  <Button variant="outline" className="w-full justify-between" onClick={toggleSortType}>
                    <span>{sortType === "rank" ? "Default Sort" : getSortButtonText()}</span>
                    {sortType === "price" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSortOrder()
                        }}
                      >
                        {sortOrder === "asc" ? <ArrowUpZA className="h-4 w-4" /> : <ArrowDownAZ className="h-4 w-4" />}
                      </Button>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </section>

          <div className="no-print filter-controls hidden md:block">
            <PriceFilter value={priceRange} onChange={setPriceRange} onReset={resetFilters} />

            {areFiltersActive() && (
              <div className="mb-4 md:mb-6 flex items-center justify-between rounded-lg border bg-background p-2 md:p-3 shadow-sm">
                <div className="flex flex-wrap items-center gap-1 md:gap-2">
                  <span className="text-xs md:text-sm text-muted-foreground">Active filters:</span>
                  {priceRange[0] !== 0 || priceRange[1] !== 5000 ? (
                    <span className="rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                      ₹{priceRange[0]} - ₹{priceRange[1]}
                    </span>
                  ) : null}
                  {discount > 0 ? (
                    <span className="rounded-full bg-green-500 px-2 py-1 text-xs font-medium text-white">
                      {discount}% Discount
                    </span>
                  ) : null}
                  {selectedProductNames.length > 0 ? (
                    <span className="rounded-full bg-blue-500 px-2 py-1 text-xs font-medium text-white">
                      {selectedProductNames.length} Products
                    </span>
                  ) : null}
                  {selectedCustomTypes.length > 0 ? (
                    <span className="rounded-full bg-purple-500 px-2 py-1 text-xs font-medium text-white">
                      {selectedCustomTypes.length} Custom
                    </span>
                  ) : null}
                </div>
                <Button variant="outline" size="sm" onClick={resetFilters} className="h-7 px-2 text-xs md:text-sm">
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
            discount={discount}
          />
        </main>

        <footer className="border-t py-4 md:py-6 text-center text-xs md:text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Product Catalog. All products subject to availability.</p>
        </footer>
      </div>
    </>
  )
}
