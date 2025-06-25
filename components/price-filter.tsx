"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Filter, RotateCcw, Percent } from "lucide-react"
import { cn } from "@/lib/utils"

interface PriceFilterProps {
  value: [number, number]
  onChange: (value: [number, number]) => void
  onReset: () => void
  discount: number
  onDiscountChange: (discount: number) => void
}

interface PriceChip {
  label: string
  min: number
  max: number
}

interface DiscountChip {
  label: string
  value: number
}

export function PriceFilter({ value, onChange, onReset, discount, onDiscountChange }: PriceFilterProps) {
  const [minInput, setMinInput] = useState(value[0].toString())
  const [maxInput, setMaxInput] = useState(value[1].toString())

  const priceChips: PriceChip[] = [
    { label: "All Prices", min: 0, max: 5000 },
    { label: "Under ₹250", min: 0, max: 250 },
    { label: "₹250 - ₹500", min: 250, max: 500 },
    { label: "₹500 - ₹1500", min: 500, max: 1500 },
    { label: "₹1500 - ₹3000", min: 1500, max: 3000 },
    { label: "₹3000 - ₹5000", min: 3000, max: 5000 },
  ]

  const discountChips: DiscountChip[] = [
    { label: "No Discount", value: 0 },
    { label: "10% Off", value: 10 },
    { label: "20% Off", value: 20 },
    { label: "30% Off", value: 30 },
  ]

  const handleSliderChange = (newValue: number[]) => {
    onChange([newValue[0], newValue[1]])
    setMinInput(newValue[0].toString())
    setMaxInput(newValue[1].toString())
  }

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = e.target.value
    setMinInput(newMin)

    if (newMin === "") return

    const numValue = Math.max(0, Math.min(Number.parseInt(newMin), value[1]))
    onChange([numValue, value[1]])
  }

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = e.target.value
    setMaxInput(newMax)

    if (newMax === "") return

    const numValue = Math.min(5000, Math.max(Number.parseInt(newMax), value[0]))
    onChange([value[0], numValue])
  }

  const handleChipClick = (chip: PriceChip) => {
    onChange([chip.min, chip.max])
    setMinInput(chip.min.toString())
    setMaxInput(chip.max.toString())
  }

  const handleDiscountChipClick = (chip: DiscountChip) => {
    onDiscountChange(chip.value)
  }

  const isChipActive = (chip: PriceChip) => {
    return value[0] === chip.min && value[1] === chip.max
  }

  const isDiscountChipActive = (chip: DiscountChip) => {
    return discount === chip.value
  }

  // Calculate adjusted max price for display when discount is applied
  const getAdjustedMaxPrice = () => {
    if (discount <= 0) return value[1]
    return Math.round(value[1] / (1 - discount / 100))
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Filter className="h-5 w-5" />
            Dynamic Price Filter
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onReset} className="h-8 px-3 text-xs">
            <RotateCcw className="mr-1 h-3 w-3" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Discount Selection */}
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-medium">Select Discount Percentage</h4>
          <div className="flex flex-wrap gap-2">
            {discountChips.map((chip) => (
              <Button
                key={chip.label}
                variant={isDiscountChipActive(chip) ? "default" : "outline"}
                size="sm"
                onClick={() => handleDiscountChipClick(chip)}
                className={cn(
                  "rounded-full",
                  isDiscountChipActive(chip) ? "bg-green-600 text-white hover:bg-green-700" : "",
                )}
              >
                {chip.label}
              </Button>
            ))}
          </div>

          {/* Custom Discount Input */}
          <div className="mt-3 flex items-center gap-2">
            <Input
              type="number"
              min={0}
              max={50}
              value={discount}
              onChange={(e) => onDiscountChange(Math.min(50, Math.max(0, Number.parseInt(e.target.value) || 0)))}
              className="w-20"
              placeholder="0"
            />
            <Percent className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Custom discount (0-50%)</span>
          </div>
        </div>

        {/* Final Price Range Selection */}
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-medium">Final Price Range {discount > 0 && "(After Discount)"}</h4>
          <div className="flex flex-wrap gap-2">
            {priceChips.map((chip) => (
              <Button
                key={chip.label}
                variant={isChipActive(chip) ? "default" : "outline"}
                size="sm"
                onClick={() => handleChipClick(chip)}
                className={cn("rounded-full", isChipActive(chip) ? "bg-primary text-primary-foreground" : "")}
              >
                {chip.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Price Range Display */}
        <div className="mb-2 flex justify-between">
          <span className="font-medium">₹{value[0]}</span>
          <span className="font-medium">₹{value[1]}</span>
        </div>

        {discount > 0 && (
          <div className="mb-2 flex justify-between text-xs text-muted-foreground">
            <span>Original MRP Range:</span>
            <span>
              ₹{Math.round(value[0] / (1 - discount / 100))} - ₹{getAdjustedMaxPrice()}
            </span>
          </div>
        )}

        <Slider
          defaultValue={[0, 5000]}
          value={[value[0], value[1]]}
          max={5000}
          step={50}
          onValueChange={handleSliderChange}
          className="mb-6"
        />

        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Min Final Price</label>
            <Input
              type="number"
              min={0}
              max={5000}
              value={minInput}
              onChange={handleMinInputChange}
              onBlur={() => {
                if (minInput === "") {
                  setMinInput("0")
                  onChange([0, value[1]])
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Max Final Price</label>
            <Input
              type="number"
              min={0}
              max={5000}
              value={maxInput}
              onChange={handleMaxInputChange}
              onBlur={() => {
                if (maxInput === "") {
                  setMaxInput("5000")
                  onChange([value[0], 5000])
                }
              }}
            />
          </div>
        </div>

        {/* Filter Logic Explanation */}
        {discount > 0 && (
          <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-800">
            <p className="font-medium mb-1">Filter Logic:</p>
            <p>• Products with MRP ≥ ₹{Math.round(value[0] / (1 - discount / 100))}</p>
            <p>• Products with MRP ≤ ₹{getAdjustedMaxPrice()}</p>
            <p>
              • Final price after {discount}% discount: ₹{value[0]} - ₹{value[1]}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
