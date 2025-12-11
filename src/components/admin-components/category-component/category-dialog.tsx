"use client";

import { useState } from "react";
import type { Category, CreateCategoryInput } from "@/schemas";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CategoryDialogsProps {
  openAddDialog: boolean;
  openEditDialog: boolean;
  openDeleteDialog: boolean;
  selectedCategory: Category | null;
  onAddDialogChange: (open: boolean) => void;
  onEditDialogChange: (open: boolean) => void;
  onDeleteDialogChange: (open: boolean) => void;
  onAddCategory: (data: CreateCategoryInput) => void;
  onEditCategory: (category: Category) => void;
  onConfirmDelete: () => void;
  isCreating?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function CategoryDialogs({
  openAddDialog,
  openEditDialog,
  openDeleteDialog,
  selectedCategory,
  onAddDialogChange,
  onEditDialogChange,
  onDeleteDialogChange,
  onAddCategory,
  onEditCategory,
  onConfirmDelete,
  isCreating = false,
  isUpdating = false,
  isDeleting = false,
}: CategoryDialogsProps) {
  const [addName, setAddName] = useState("");
  const [addSlug, setAddSlug] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [addIcon, setAddIcon] = useState("");
  const [addColor, setAddColor] = useState("#3B82F6");
  const [addIsActive, setAddIsActive] = useState(true);

  const handleAddSubmit = () => {
    if (addName.trim() && addSlug.trim()) {
      onAddCategory({
        name: addName,
        slug: addSlug,
        description: addDescription || null,
        icon: addIcon || null,
        color: addColor,
        isActive: addIsActive,
        sortOrder: 0,
      });
      // Reset form
      setAddName("");
      setAddSlug("");
      setAddDescription("");
      setAddIcon("");
      setAddColor("#3B82F6");
      setAddIsActive(true);
    }
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCategory) return;
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const icon = formData.get("icon") as string;
    const color = formData.get("color") as string;
    const isActive = formData.get("isActive") === "on";

    if (name.trim() && slug.trim()) {
      onEditCategory({
        ...selectedCategory,
        name,
        slug,
        description: description || null,
        icon: icon || null,
        color,
        isActive,
      });
    }
  };

  return (
    <>
      {/* Add Category Dialog */}
      <Dialog open={openAddDialog} onOpenChange={onAddDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>
              Create a new category for your services
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category-name" className="text-right">
                Name
              </Label>
              <Input
                id="category-name"
                placeholder="Enter category name"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category-slug" className="text-right">
                Slug
              </Label>
              <Input
                id="category-slug"
                placeholder="category-slug"
                value={addSlug}
                onChange={(e) => setAddSlug(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="category-description"
                placeholder="Enter description (optional)"
                value={addDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAddDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category-icon" className="text-right">
                Icon
              </Label>
              <Input
                id="category-icon"
                placeholder="Icon name (optional)"
                value={addIcon}
                onChange={(e) => setAddIcon(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category-color" className="text-right">
                Color
              </Label>
              <Input
                id="category-color"
                type="color"
                value={addColor}
                onChange={(e) => setAddColor(e.target.value)}
                className="col-span-3 h-10"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category-active" className="text-right">
                Active
              </Label>
              <div className="col-span-3 flex items-center">
                <input
                  id="category-active"
                  type="checkbox"
                  checked={addIsActive}
                  onChange={(e) => setAddIsActive(e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onAddDialogChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSubmit}
              disabled={isCreating || !addName.trim() || !addSlug.trim()}
            >
              {isCreating ? "Creating..." : "Add Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={openEditDialog} onOpenChange={onEditDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} key={selectedCategory?.id}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-category-name"
                  name="name"
                  placeholder="Enter category name"
                  defaultValue={selectedCategory?.name || ""}
                  required
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category-slug" className="text-right">
                  Slug
                </Label>
                <Input
                  id="edit-category-slug"
                  name="slug"
                  placeholder="category-slug"
                  defaultValue={selectedCategory?.slug || ""}
                  required
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category-description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="edit-category-description"
                  name="description"
                  placeholder="Enter description (optional)"
                  defaultValue={selectedCategory?.description || ""}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category-icon" className="text-right">
                  Icon
                </Label>
                <Input
                  id="edit-category-icon"
                  name="icon"
                  placeholder="Icon name (optional)"
                  defaultValue={selectedCategory?.icon || ""}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category-color" className="text-right">
                  Color
                </Label>
                <Input
                  id="edit-category-color"
                  name="color"
                  type="color"
                  defaultValue={selectedCategory?.color || "#3B82F6"}
                  className="col-span-3 h-10"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category-active" className="text-right">
                  Active
                </Label>
                <div className="col-span-3 flex items-center">
                  <input
                    id="edit-category-active"
                    name="isActive"
                    type="checkbox"
                    defaultChecked={selectedCategory?.isActive ?? true}
                    className="h-4 w-4"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onEditDialogChange(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onOpenChange={onDeleteDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedCategory?.name}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onDeleteDialogChange(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
