import * as React from "react"
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Filter, X, ChevronsRight, ChevronRight, ChevronLeft, ChevronsLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { DataTableColumn, ColumnFilter } from "@/types"
import { useServerSideTable } from "@/hooks/use-server-side-table"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ExportButton } from "@/base-components/base-export-button"
import { MultiSelect } from "./base-multi-select"

interface ServerSideDataTableProps<T = any> {
  data: {
    data: T[]
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number | null
    to: number | null
  }
  columns: DataTableColumn<T>[]
  queryParams?: {
    search?: string
    sort?: string
    direction?: 'asc' | 'desc'
    filters?: Record<string, any>
    per_page?: number
  }
  filterOptions?: Record<string, any>
  searchable?: boolean
  searchPlaceholder?: string
  filterable?: boolean
  filters?: ColumnFilter[]
  sortable?: boolean
  exportable?: boolean
  exportUrl?: string
  loading?: boolean
  emptyMessage?: string
  className?: string
  onRowClick?: (row: T) => void
}

export function ServerSideDataTable<T>({
  data,
  columns,
  queryParams = {},
  filterOptions = {},
  searchable = true,
  searchPlaceholder = "Search...",
  filterable = true,
  filters = [],
  sortable = true,
  exportable = true,
  exportUrl,
  loading = false,
  emptyMessage = "No data available",
  className,
  onRowClick,
}: ServerSideDataTableProps<T>) {
  const isMobile = useIsMobile()
  const [searchInput, setSearchInput] = React.useState(queryParams.search || '')

  const {
    currentParams,
    isSearching,
    hasActiveFilters,
    handleSearch,
    handleSort,
    handleFilter,
    handlePageChange,
    handlePerPageChange,
    clearFilters,
    clearSearch,
    getSortDirection,
    getFilterValues,
  } = useServerSideTable(queryParams)

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (queryParams.search || '')) {
        handleSearch(searchInput)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput, queryParams.search, handleSearch])

  const renderSortIcon = (column: DataTableColumn<T>) => {
    if (!sortable || !column.sortable) return null

    const direction = getSortDirection(String(column.key))

    if (direction === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4" />
    } else if (direction === 'desc') {
      return <ArrowDown className="ml-2 h-4 w-4" />
    } else {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
  }

  const renderCellContent = (column: DataTableColumn<T>, row: T) => {
    const value = (row as any)[column.key]

    if (column.render) {
      return column.render(value, row)
    }

    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">—</span>
    }

    return String(value)
  }

  // Generate filter options from provided data
  const getFilterOptionsForColumn = (filter: ColumnFilter) => {
    if (filter.options && filter.options.length > 0) {
      return filter.options
    }

    // Use server-provided filter options
    const serverOptions = filterOptions[filter.key] || filterOptions[`${filter.key}s`]
    if (serverOptions && Array.isArray(serverOptions)) {
      return serverOptions.map((option: any) => ({
        label: String(option),
        value: option
      }))
    }

    return []
  }

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>

        {/* Search and filters skeleton */}
        {(searchable || filterable) && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {searchable && <Skeleton className="h-9 w-full sm:w-80" />}
            {filterable && <Skeleton className="h-9 w-32" />}
          </div>
        )}

        {/* Table skeleton */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead key={index}>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination skeleton */}
        <Skeleton className="h-8 w-full" />
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filters */}
      {(searchable || filterable || exportable) && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          {searchable && (
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 pr-9"
              />
              {isSearching && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchInput('')
                    clearSearch()
                  }}
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}

          {/* Filters and Export */}
          <div className="flex items-center gap-2">
            {filterable && filters.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                        {Object.keys(currentParams.filters || {}).length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-4">
                  <div className="space-y-4">
                    {filters.map((filter) => (
                      <div key={filter.key} className="space-y-2">
                        <label className="text-sm font-medium">{filter.label}</label>
                        <MultiSelect
                          options={getFilterOptionsForColumn(filter)}
                          value={getFilterValues(filter.key)}
                          onChange={(values) => handleFilter(filter.key, values)}
                          placeholder={`Select ${filter.label.toLowerCase()}...`}
                        />
                      </div>
                    ))}
                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="w-full"
                      >
                        Clear all filters
                      </Button>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Export Button */}
            {exportable && exportUrl && (
              <ExportButton
                exportUrl={exportUrl}
                queryParams={currentParams}
              />
            )}
          </div>
        </div>
      )}

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(currentParams.filters || {}).map(([key, values]) => {
            if (!Array.isArray(values) || values.length === 0) return null

            const filter = filters.find(f => f.key === key)
            const label = filter?.label || key

            return (
              <Badge key={key} variant="secondary" className="gap-1">
                {label}: {values.length} selected
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilter(key, [])}
                  className="h-3 w-3 p-0 hover:bg-transparent"
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )
          })}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  className={cn(
                    column.headerClassName,
                    sortable && column.sortable && "cursor-pointer select-none hover:bg-muted/50"
                  )}
                  onClick={() => sortable && column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center">
                    {column.label}
                    {renderSortIcon(column)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((row, index) => (
                <TableRow
                  key={index}
                  className={cn(
                    onRowClick && "cursor-pointer hover:bg-muted/50"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={String(column.key)}
                      className={column.className}
                    >
                      {renderCellContent(column, row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data.data.length > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {data.from || 0} to {data.to || 0} of {data.total} results
            </div>

            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">Show</span>
              <Select
                value={String(data.per_page)}
                onValueChange={(value) => handlePerPageChange(Number(value))}
              >
                <SelectTrigger className="w-16 sm:w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground hidden sm:inline">per page</span>
              <span className="text-sm text-muted-foreground sm:hidden">/page</span>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-end space-x-2">
            {/* First page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={data.current_page <= 1}
              className="h-8 w-8 p-0 cursor-pointer"
            >
              <ChevronsLeft />
            </Button>

            {/* Previous page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(data.current_page - 1)}
              disabled={data.current_page <= 1}
              className="h-8 w-8 p-0 cursor-pointer"
            >
              <ChevronLeft />
            </Button>

            {/* Page numbers - hidden on mobile */}
            <div className="hidden sm:flex items-center space-x-1 ">
              {Array.from({ length: Math.min(5, data.last_page) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(data.last_page - 4, data.current_page - 2)) + i;
                if (pageNum > data.last_page) return null;

                return (
                  <Button
                    key={pageNum}
                    variant={data.current_page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="h-8 w-8 p-0 cursor-pointer"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            {/* Mobile page info */}
            <div className="sm:hidden text-sm text-muted-foreground">
              Page {data.current_page} of {data.last_page}
            </div>

            {/* Next page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(data.current_page + 1)}
              disabled={data.current_page >= data.last_page}
              className="h-8 w-8 p-0 cursor-pointer"
            >
              <ChevronRight />
            </Button>

            {/* Last page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(data.last_page)}
              disabled={data.current_page >= data.last_page}
              className="h-8 w-8 p-0 cursor-pointer"
            >
              <ChevronsRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
