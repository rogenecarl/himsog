"use client"

import type React from "react"
import { useState, useMemo } from "react"
import type { Category, CreateCategoryInput } from "@/schemas"
import { CategoryDialogs } from "@/components/admin-components/category-component/category-dialog"
import { CategoryTable } from "@/components/admin-components/category-component/category-table"
import { CategoryTableSkeleton } from "@/components/admin-components/category-component/category-table-skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Loader2 } from "lucide-react"
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/use-category"

export default function ManageCategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const ITEMS_PER_PAGE = 10

  // Fetch categories using TanStack Query
  const { data: categories = [], isLoading, isError, error } = useCategories()

  // Mutations
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const handleAddCategory = (data: CreateCategoryInput) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setOpenAddDialog(false)
      },
    })
  }

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category)
    setOpenEditDialog(true)
  }

  const handleSaveEdit = (updatedCategory: Category) => {
    updateMutation.mutate(
      {
        id: updatedCategory.id,
        data: {
          name: updatedCategory.name,
          slug: updatedCategory.slug,
          description: updatedCategory.description,
          icon: updatedCategory.icon,
          color: updatedCategory.color,
          isActive: updatedCategory.isActive,
          sortOrder: updatedCategory.sortOrder,
        },
      },
      {
        onSuccess: () => {
          setOpenEditDialog(false)
          setSelectedCategory(null)
        },
      }
    )
  }

  const handleOpenDeleteDialog = (category: Category) => {
    setSelectedCategory(category)
    setOpenDeleteDialog(true)
  }

  const handleConfirmDelete = () => {
    if (selectedCategory) {
      deleteMutation.mutate(selectedCategory.id, {
        onSuccess: () => {
          setOpenDeleteDialog(false)
          setSelectedCategory(null)
        },
      })
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [categories, searchQuery])

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Manage Categories</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">View and manage all service categories</p>
        </div>
        <Button
          className="gap-2 w-full sm:w-auto"
          onClick={() => setOpenAddDialog(true)}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          <span className="sm:inline">Add Category</span>
        </Button>
      </div>

      {/* Search Input Field */}
      <div className="mb-4 sm:mb-6 flex gap-2">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
          <p className="text-destructive text-sm">
            Error loading categories: {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-card rounded-lg border overflow-hidden">
          <CategoryTableSkeleton />
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-card rounded-lg border overflow-hidden">
            <CategoryTable
              categories={filteredCategories as Category[]}
              onEdit={handleEditCategory}
              onDelete={handleOpenDeleteDialog}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </div>
        </>
      )}

      {/* Stats */}
      {!isLoading && categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8">
          <div className="bg-card rounded-lg border p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Categories</p>
            <p className="text-2xl sm:text-3xl font-bold">{categories.length}</p>
          </div>
          <div className="bg-card rounded-lg border p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Active Categories</p>
            <p className="text-2xl sm:text-3xl font-bold">
              {categories.filter((c) => c.isActive).length}
            </p>
          </div>
          <div className="bg-card rounded-lg border p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Last Updated</p>
            <p className="text-sm font-medium">
              {categories.length > 0
                ? new Date(Math.max(...categories.map((c) => new Date(c.updatedAt).getTime()))).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
                : "-"}
            </p>
          </div>
        </div>
      )}


      <CategoryDialogs
        openAddDialog={openAddDialog}
        openEditDialog={openEditDialog}
        openDeleteDialog={openDeleteDialog}
        selectedCategory={selectedCategory}
        onAddDialogChange={setOpenAddDialog}
        onEditDialogChange={setOpenEditDialog}
        onDeleteDialogChange={setOpenDeleteDialog}
        onAddCategory={handleAddCategory}
        onEditCategory={handleSaveEdit}
        onConfirmDelete={handleConfirmDelete}
        isCreating={createMutation.isPending}
        isUpdating={updateMutation.isPending}
        isDeleting={deleteMutation.isPending}
      />
    </main>
  )
}
