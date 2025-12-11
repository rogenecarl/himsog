"use client";

import type { ProviderStatus } from "@/lib/generated/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProviderTableData {
  id: string;
  healthcareName: string;
  status: ProviderStatus;
  phoneNumber: string | null;
  email: string | null;
  city: string;
  province: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  _count: {
    services: number;
    documents: number;
  };
}

interface ProviderTableProps {
  providers: ProviderTableData[];
  onView: (provider: ProviderTableData) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export function ProviderTable({
  providers,
  onView,
  currentPage,
  onPageChange,
  totalPages,
  totalItems,
  itemsPerPage,
}: ProviderTableProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusVariant = (status: ProviderStatus) => {
    switch (status) {
      case "VERIFIED":
        return "default";
      case "PENDING":
        return "secondary";
      case "SUSPENDED":
        return "destructive";
      case "REJECTED":
        return "outline";
      default:
        return "secondary";
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <>
      {/* Desktop/Tablet Table View */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-3 py-3 min-w-[200px]">Provider</TableHead>
              <TableHead className="px-3 py-3 min-w-[100px]">Category</TableHead>
              <TableHead className="px-3 py-3 min-w-[120px]">Location</TableHead>
              <TableHead className="px-3 py-3 min-w-[100px]">Status</TableHead>
              <TableHead className="px-3 py-3 min-w-[80px] text-center">Services</TableHead>
              <TableHead className="px-3 py-3 min-w-[80px] text-center">Docs</TableHead>
              <TableHead className="px-3 py-3 min-w-[90px]">Joined</TableHead>
              <TableHead className="px-3 py-3 w-20 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-12"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Building2 className="h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground font-medium">No providers found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search or filters
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              providers.map((provider) => (
                <TableRow key={provider.id} className="hover:bg-muted/50">
                  <TableCell className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={provider.user.image || undefined} />
                        <AvatarFallback className="text-xs">
                          {provider.user.name?.[0] || provider.healthcareName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {provider.healthcareName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {provider.user.name || provider.user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    {provider.category ? (
                      <Badge variant="outline" className="text-xs whitespace-nowrap">
                        {provider.category.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell className="px-3 py-3 text-xs">
                    <div>
                      <p className="font-medium">{provider.city}</p>
                      <p className="text-muted-foreground">{provider.province}</p>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-3">
                    <Badge variant={getStatusVariant(provider.status)} className="text-xs">
                      {provider.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-3 py-3 text-center text-sm">
                    {provider._count.services}
                  </TableCell>
                  <TableCell className="px-3 py-3 text-center text-sm">
                    {provider._count.documents}
                  </TableCell>
                  <TableCell className="px-3 py-3 text-xs whitespace-nowrap">
                    {formatDate(provider.createdAt)}
                  </TableCell>
                  <TableCell className="px-3 py-3 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(provider)}
                      className="h-8 w-8"
                      title="View provider details"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View {provider.healthcareName}</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4 p-4">
        {providers.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12">
            <Building2 className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground font-medium">No providers found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          providers.map((provider) => (
            <div
              key={provider.id}
              className="bg-card border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={provider.user.image || undefined} />
                  <AvatarFallback>
                    {provider.user.name?.[0] || provider.healthcareName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">
                    {provider.healthcareName}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {provider.user.name || provider.user.email}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={getStatusVariant(provider.status)} className="text-xs">
                      {provider.status}
                    </Badge>
                    {provider.category && (
                      <Badge variant="outline" className="text-xs">
                        {provider.category.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Location</p>
                  <p className="font-medium">{provider.city}</p>
                  <p className="text-xs text-muted-foreground">{provider.province}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Contact</p>
                  <p className="font-medium text-xs truncate">
                    {provider.phoneNumber || "-"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {provider.email || provider.user.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center p-2 bg-muted rounded">
                  <p className="font-semibold">{provider._count.services}</p>
                  <p className="text-muted-foreground">Services</p>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <p className="font-semibold">{provider._count.documents}</p>
                  <p className="text-muted-foreground">Documents</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs text-muted-foreground">
                  Joined {formatDate(provider.createdAt)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(provider)}
                  className="h-8"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Showing {startItem} to {endItem} of {totalItems} providers
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
