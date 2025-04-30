"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface MultiSelectProps {
  options: { label: string; value: string }[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  id?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  id,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleUnselect = (item: string) => {
    onChange(selected.filter((i) => i !== item))
  }

  const handleSelect = (value: string) => {
    // Check if the item is already selected
    if (selected.includes(value)) {
      // If selected, remove it
      onChange(selected.filter((i) => i !== value))
    } else {
      // If not selected, add it
      onChange([...selected, value])
    }
    // Don't close the popover after selection
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          id={id}
          className={cn(
            "group flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 cursor-pointer",
            className,
          )}
        >
          <div className="flex flex-wrap gap-1">
            {selected.map((item) => {
              const option = options.find((o) => o.value === item)
              return (
                <Badge key={item} variant="secondary" className="rounded-sm px-1 font-normal">
                  {option?.label || item}
                  <button
                    className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUnselect(item)
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleUnselect(item)
                    }}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              )
            })}
            {selected.length === 0 && <span className="text-sm text-muted-foreground">{placeholder}</span>}
          </div>
          <div className="flex shrink-0 opacity-50 group-hover:opacity-100">
            {selected.length > 0 ? (
              <button
                className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onChange([])
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onChange([])
                }}
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            ) : null}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-full p-0"
        align="start"
        side="bottom"
        sideOffset={5}
        avoidCollisions={false}
        style={{
          width: "var(--radix-popover-trigger-width)",
          minWidth: "200px",
          maxWidth: "100vw",
          zIndex: 100,
        }}
      >
        <Command>
          <CommandInput placeholder="Search options..." />
          <CommandList className="max-h-[200px]">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => {
                      handleSelect(option.value)
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <X className="h-3 w-3" />
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
          <div className="border-t p-2">
            <button
              className="w-full rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground"
              onClick={() => setOpen(false)}
            >
              Done
            </button>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
