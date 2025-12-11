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

interface UserFiltersProps {
  filters: {
    search: string;
    role: string;
    status: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onClear: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function UserFilters({
  filters,
  onFilterChange,
  onClear,
  onRefresh,
  isRefreshing,
}: UserFiltersProps) {
  const hasFilters =
    filters.search || filters.role !== "all" || filters.status !== "all";

  return (
    <div className="flex flex-wrap gap-4 items-center">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Role Filter */}
      <Select
        value={filters.role}
        onValueChange={(value) => onFilterChange("role", value)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="USER">User</SelectItem>
          <SelectItem value="PROVIDER">Provider</SelectItem>
          <SelectItem value="ADMIN">Admin</SelectItem>
        </SelectContent>
      </Select>

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
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="SUSPENDED">Suspended</SelectItem>
          <SelectItem value="DELETED">Deleted</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasFilters && (
        <Button variant="outline" size="icon" onClick={onClear} title="Clear filters">
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
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      )}
    </div>
  );
}
