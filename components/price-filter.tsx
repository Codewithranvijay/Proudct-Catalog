"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Filter, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface PriceFilterProps {
  value: [number, number]
  onChange: (value: [number, number]) => void
  onReset: () => void
}

interface PriceChip {
  label: string
  min: number
  max: number
}

export function PriceFilter({ value, onChange, onReset }: PriceFilterProps) {
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

  const isChipActive = (chip: PriceChip) => {
    return value[0] === chip.min && value[1] === chip.max
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Filter className="h-5 w-5" />
            Price Filter
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onReset} className="h-8 px-3 text-xs">
            <RotateCcw className="mr-1 h-3 w-3" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-wrap gap-2">
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

        <div className="mb-2 flex justify-between">
          <span className="font-medium">₹{value[0]}</span>
          <span className="font-medium">₹{value[1]}</span>
        </div>

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
            <label className="text-sm font-medium">Min Price</label>
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
            <label className="text-sm font-medium">Max Price</label>
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
      </CardContent>
    </Card>
  )
}
