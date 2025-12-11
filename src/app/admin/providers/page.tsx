"use client";

import type React from "react";
import { useState, useMemo, useCallback } from "react";
import type { ProviderStatus } from "@/lib/generated/prisma";
import { ProviderDialog } from "@/components/admin-components/provider-component/provider-dialog";
import { ProviderTable } from "@/components/admin-components/provider-component/provider-table";
import { Input } from "@/components/ui/input";
import { Search, Filter, RefreshCw } from "lucide-react";
import {
  useAdminProvider,
  useAdminProviders,
  useUpdateProviderStatus,
  useUpdateDocumentStatus,
} from "@/hooks/use-admin-get-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";

const ITEMS_PER_PAGE = 10;

export default function ManageProvidersPage() {
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProviderStatus | "ALL">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [updatingDocumentId, setUpdatingDocumentId] = useState<string | null>(null);

  // Debounce search to avoid too many requests
  const debouncedSearch = useDebounce(searchInput, 300);

  // Build query params for server-side pagination
  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      search: debouncedSearch || undefined,
      status: statusFilter,
    }),
    [currentPage, debouncedSearch, statusFilter]
  );

  // Fetch providers with server-side pagination
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useAdminProviders(queryParams);

  // Fetch selected provider details
  const { data: selectedProvider, isLoading: isLoadingProvider } = useAdminProvider(
    selectedProviderId || ""
  );

  // Mutations
  const updateStatusMutation = useUpdateProviderStatus();
  const updateDocumentMutation = useUpdateDocumentStatus();

  const handleViewProvider = useCallback((provider: { id: string }) => {
    setSelectedProviderId(provider.id);
    setOpenViewDialog(true);
  }, []);

  const handleStatusUpdate = useCallback(
    (providerId: string, status: ProviderStatus) => {
      updateStatusMutation.mutate(
        { providerId, status },
        {
          onSuccess: () => {
            setOpenViewDialog(false);
            setSelectedProviderId(null);
          },
        }
      );
    },
    [updateStatusMutation]
  );

  const handleDocumentStatusUpdate = useCallback(
    (documentId: string, verificationStatus: "PENDING" | "VERIFIED" | "REJECTED") => {
      setUpdatingDocumentId(documentId);
      updateDocumentMutation.mutate(
        { documentId, verificationStatus },
        {
          onSettled: () => {
            setUpdatingDocumentId(null);
          },
        }
      );
    },
    [updateDocumentMutation]
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value as ProviderStatus | "ALL");
    setCurrentPage(1); // Reset to first page on filter change
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Get status counts from server response
  const statusCounts = data?.statusCounts ?? {
    all: 0,
    pending: 0,
    verified: 0,
    suspended: 0,
    rejected: 0,
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Manage Providers
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          View and manage all healthcare providers
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search providers..."
            value={searchInput}
            onChange={handleSearchChange}
            className="pl-10 h-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-full sm:w-[200px] h-10">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status ({statusCounts.all})</SelectItem>
              <SelectItem value="PENDING">Pending ({statusCounts.pending})</SelectItem>
              <SelectItem value="VERIFIED">Verified ({statusCounts.verified})</SelectItem>
              <SelectItem value="SUSPENDED">Suspended ({statusCounts.suspended})</SelectItem>
              <SelectItem value="REJECTED">Rejected ({statusCounts.rejected})</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="h-10 w-10"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <div className="bg-card rounded-lg border p-3 hover:shadow-md transition-shadow">
          <p className="text-xs text-muted-foreground mb-1">Total</p>
          {isLoading ? (
            <Skeleton className="h-8 w-12 bg-slate-200 dark:bg-white/10" />
          ) : (
            <p className="text-2xl font-bold">{statusCounts.all}</p>
          )}
        </div>
        <div className="bg-card rounded-lg border p-3 hover:shadow-md transition-shadow">
          <p className="text-xs text-muted-foreground mb-1">Pending</p>
          {isLoading ? (
            <Skeleton className="h-8 w-12 bg-slate-200 dark:bg-white/10" />
          ) : (
            <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
          )}
        </div>
        <div className="bg-card rounded-lg border p-3 hover:shadow-md transition-shadow">
          <p className="text-xs text-muted-foreground mb-1">Verified</p>
          {isLoading ? (
            <Skeleton className="h-8 w-12 bg-slate-200 dark:bg-white/10" />
          ) : (
            <p className="text-2xl font-bold text-green-600">{statusCounts.verified}</p>
          )}
        </div>
        <div className="bg-card rounded-lg border p-3 hover:shadow-md transition-shadow">
          <p className="text-xs text-muted-foreground mb-1">Suspended</p>
          {isLoading ? (
            <Skeleton className="h-8 w-12 bg-slate-200 dark:bg-white/10" />
          ) : (
            <p className="text-2xl font-bold text-red-600">{statusCounts.suspended}</p>
          )}
        </div>
        <div className="bg-card rounded-lg border p-3 hover:shadow-md transition-shadow col-span-2 sm:col-span-3 lg:col-span-1">
          <p className="text-xs text-muted-foreground mb-1">Rejected</p>
          {isLoading ? (
            <Skeleton className="h-8 w-12 bg-slate-200 dark:bg-white/10" />
          ) : (
            <p className="text-2xl font-bold text-gray-600">{statusCounts.rejected}</p>
          )}
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
          <p className="text-destructive text-sm">
            Error loading providers:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <Skeleton className="h-12 w-full bg-slate-200 dark:bg-white/10" />
          <Skeleton className="h-12 w-full bg-slate-200 dark:bg-white/10" />
          <Skeleton className="h-12 w-full bg-slate-200 dark:bg-white/10" />
          <Skeleton className="h-12 w-full bg-slate-200 dark:bg-white/10" />
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-card rounded-lg border overflow-hidden shadow-sm">
            <ProviderTable
              providers={data?.providers ?? []}
              onView={handleViewProvider}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              totalPages={data?.pagination.totalPages ?? 1}
              totalItems={data?.pagination.total ?? 0}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </div>
        </>
      )}

      {/* View/Edit Provider Dialog */}
      <ProviderDialog
        open={openViewDialog}
        onOpenChange={setOpenViewDialog}
        provider={selectedProvider || null}
        isLoadingProvider={isLoadingProvider}
        onStatusUpdate={handleStatusUpdate}
        onDocumentStatusUpdate={handleDocumentStatusUpdate}
        isUpdating={updateStatusMutation.isPending}
        isUpdatingDocument={updateDocumentMutation.isPending}
        updatingDocumentId={updatingDocumentId}
      />
    </main>
  );
}
