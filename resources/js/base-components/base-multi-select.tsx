import * as React from "react"
import { Check, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

export interface MultiSelectOption {
  label: string
  value: string | number
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  value: (string | number)[]
  onChange: (value: (string | number)[]) => void
  placeholder?: string
  searchPlaceholder?: string
  className?: string
  disabled?: boolean
  maxDisplayed?: number
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select items...",
  searchPlaceholder = "Search...",
  className,
  disabled = false,
  maxDisplayed = 3,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

  const filteredOptions = React.useMemo(() => {
    if (!searchTerm) return options
    return options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [options, searchTerm])

  const selectedOptions = React.useMemo(() => {
    return options.filter(option => value.includes(option.value))
  }, [options, value])

  const handleSelect = (optionValue: string | number) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue]
    onChange(newValue)
  }

  const handleRemove = (optionValue: string | number) => {
    onChange(value.filter(v => v !== optionValue))
  }

  const handleClear = () => {
    onChange([])
  }

  const displayText = React.useMemo(() => {
    if (selectedOptions.length === 0) return placeholder
    if (selectedOptions.length <= maxDisplayed) {
      return selectedOptions.map(option => option.label).join(", ")
    }
    return `${selectedOptions.slice(0, maxDisplayed).map(option => option.label).join(", ")} +${selectedOptions.length - maxDisplayed} more`
  }, [selectedOptions, placeholder, maxDisplayed])

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between text-left font-normal",
            !value.length && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <span className="truncate">{displayText}</span>
          <div className="flex items-center gap-1">
            {value.length > 0 && (
              <div
                className="flex h-4 w-4 items-center justify-center rounded hover:bg-muted cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClear()
                }}
              >
                <X className="h-3 w-3" />
              </div>
            )}
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full p-0" align="start">
        <div className="p-2">
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8"
          />
        </div>
        <div className="max-h-60 overflow-auto">
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No options found.
            </div>
          ) : (
            filteredOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onSelect={() => handleSelect(option.value)}
                className="cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <div className="flex h-4 w-4 items-center justify-center">
                    {value.includes(option.value) && (
                      <Check className="h-3 w-3" />
                    )}
                  </div>
                  <span>{option.label}</span>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        {value.length > 0 && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-full text-xs"
            >
              Clear all
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Selected items display component
export function MultiSelectBadges({
  options,
  value,
  onChange,
  maxDisplayed = 3,
  className,
}: {
  options: MultiSelectOption[]
  value: (string | number)[]
  onChange: (value: (string | number)[]) => void
  maxDisplayed?: number
  className?: string
}) {
  const selectedOptions = options.filter(option => value.includes(option.value))

  const handleRemove = (optionValue: string | number) => {
    onChange(value.filter(v => v !== optionValue))
  }

  if (selectedOptions.length === 0) return null

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {selectedOptions.slice(0, maxDisplayed).map((option) => (
        <Badge
          key={option.value}
          variant="secondary"
          className="text-xs"
        >
          {option.label}
          <div
            className="ml-1 flex h-3 w-3 items-center justify-center rounded hover:bg-muted cursor-pointer"
            onClick={() => handleRemove(option.value)}
          >
            <X className="h-2 w-2" />
          </div>
        </Badge>
      ))}
      {selectedOptions.length > maxDisplayed && (
        <Badge variant="outline" className="text-xs">
          +{selectedOptions.length - maxDisplayed} more
        </Badge>
      )}
    </div>
  )
}
