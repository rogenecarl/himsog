"use client";

import type { Category } from "@/schemas";
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
import { Pencil, Trash2 } from "lucide-react";
import { PaginationControls } from "@/components/pagination-controls";

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
}

export function CategoryTable({
  categories,
  onEdit,
  onDelete,
  currentPage,
  onPageChange,
  itemsPerPage,
}: CategoryTableProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = categories.slice(startIndex, endIndex);

  return (
    <>
      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4 xl:px-6 py-4">Name</TableHead>
              <TableHead className="px-4 xl:px-6 py-4">Slug</TableHead>
              <TableHead className="px-4 xl:px-6 py-4">Icon</TableHead>
              <TableHead className="px-4 xl:px-6 py-4">Color</TableHead>
              <TableHead className="px-4 xl:px-6 py-4">Description</TableHead>
              <TableHead className="px-4 xl:px-6 py-4">Status</TableHead>
              <TableHead className="px-4 xl:px-6 py-4">Created At</TableHead>
              <TableHead className="px-4 xl:px-6 py-4 w-20 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCategories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-muted-foreground"
                >
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              paginatedCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="px-4 xl:px-6 py-4 font-medium">
                    {category.name}
                  </TableCell>
                  <TableCell className="px-4 xl:px-6 py-4 text-muted-foreground text-sm">
                    {category.slug}
                  </TableCell>
                  <TableCell className="px-4 xl:px-6 py-4 text-sm">
                    {category.icon || "-"}
                  </TableCell>
                  <TableCell className="px-4 xl:px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded border shrink-0" 
                        style={{ backgroundColor: category.color || "#3B82F6" }}
                      />
                      <span className="text-xs text-muted-foreground hidden xl:inline">{category.color || "#3B82F6"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 xl:px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">
                    {category.description || "-"}
                  </TableCell>
                  <TableCell className="px-4 xl:px-6 py-4">
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 xl:px-6 py-4 text-sm">
                    {formatDate(category.createdAt)}
                  </TableCell>
                  <TableCell className="px-4 xl:px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(category)}
                        className="h-8 w-8 text-green-700"
                        title="Edit category"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit {category.name}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(category)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        title="Delete category"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete {category.name}</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View - Visible only on mobile/tablet */}
      <div className="lg:hidden space-y-4 p-4">
        {paginatedCategories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No categories found
          </div>
        ) : (
          paginatedCategories.map((category) => (
            <div
              key={category.id}
              className="bg-card border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base truncate">{category.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{category.slug}</p>
                </div>
                <Badge variant={category.isActive ? "default" : "secondary"} className="shrink-0">
                  {category.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Icon</p>
                  <p className="font-medium truncate">{category.icon || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Color</p>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-5 h-5 rounded border shrink-0" 
                      style={{ backgroundColor: category.color || "#3B82F6" }}
                    />
                    <span className="text-xs truncate">{category.color || "#3B82F6"}</span>
                  </div>
                </div>
              </div>

              {category.description && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Description</p>
                  <p className="text-sm line-clamp-2">{category.description}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs text-muted-foreground">
                  {formatDate(category.createdAt)}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(category)}
                    className="h-8 px-3 text-green-700"
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(category)}
                    className="h-8 px-3 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="border-t">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            totalItems={categories.length}
            itemsPerPage={itemsPerPage}
            itemName="categories"
          />
        </div>
      )}
    </>
  );
}
