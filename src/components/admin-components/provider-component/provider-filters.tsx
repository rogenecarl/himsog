"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, RefreshCw } from "lucide-react";
import { useCategories } from "@/hooks/use-category";

interface ProviderFiltersProps {
  filters: {
    search: string;
    status: string;
    category: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onClear: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function ProviderFilters({
  filters,
  onFilterChange,
  onClear,
  onRefresh,
  isRefreshing,
}: ProviderFiltersProps) {
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const hasFilters =
    filters.search || filters.status !== "all" || filters.category !== "all";

  return (
    <div className="flex flex-wrap gap-4 items-center">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or phone..."
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Status Filter */}
      <Select
        value={filters.status}
        onValueChange={(value) => onFilterChange("status", value)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="VERIFIED">Verified</SelectItem>
          <SelectItem value="SUSPENDED">Suspended</SelectItem>
          <SelectItem value="REJECTED">Rejected</SelectItem>
        </SelectContent>
      </Select>

      {/* Category Filter */}
      <Select
        value={filters.category}
        onValueChange={(value) => onFilterChange("category", value)}
        disabled={categoriesLoading}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories?.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasFilters && (
        <Button
          variant="outline"
          size="icon"
          onClick={onClear}
          title="Clear filters"
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {/* Refresh Button */}
      {onRefresh && (
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh data"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </Button>
      )}
    </div>
  );
}
