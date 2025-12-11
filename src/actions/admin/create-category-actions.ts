"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "../auth/auth-check-utils";
import { 
  CreateCategorySchema,
  UpdateCategorySchema,
  type CreateCategoryInput, 
  type UpdateCategoryInput,
  type Category,
  type CategoryWithProviderCount,
  type CategoryWithProviders
} from "@/schemas";
import type { ActionResponse } from "@/types/api";

// Create category
export async function createCategory(
  data: CreateCategoryInput
): Promise<ActionResponse<Category>> {
  try {
    // 🔒 Require ADMIN role
    await requireAdmin();

    // Validate input
    const validatedFields = CreateCategorySchema.safeParse(data);
    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error.issues[0]?.message || "Invalid input data",
      };
    }

    const validData = validatedFields.data;

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug: validData.slug },
    });

    if (existingCategory) {
      return {
        success: false,
        error: "A category with this slug already exists",
      };
    }

    const category = await prisma.category.create({
      data: {
        name: validData.name,
        slug: validData.slug,
        description: validData.description,
        icon: validData.icon,
        color: validData.color,
        isActive: validData.isActive,
        sortOrder: validData.sortOrder,
      },
    });

    revalidatePath("/admin/category");
    return { success: true, data: category as Category };
  } catch (error) {
    console.error("Error creating category:", error);
    return { success: false, error: "Failed to create category" };
  }
}

// Update category
export async function updateCategory(
  id: string,
  data: UpdateCategoryInput
): Promise<ActionResponse<Category>> {
  try {
    // 🔒 Require ADMIN role
    await requireAdmin();

    // Validate input
    const validatedFields = UpdateCategorySchema.safeParse(data);
    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error.issues[0]?.message || "Invalid input data",
      };
    }

    const validData = validatedFields.data;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return { success: false, error: "Category not found" };
    }

    // Check if slug is being changed and if new slug already exists
    if (validData.slug && validData.slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug: validData.slug },
      });

      if (slugExists) {
        return {
          success: false,
          error: "A category with this slug already exists",
        };
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: validData,
    });

    revalidatePath("/admin/category");
    return { success: true, data: category as Category };
  } catch (error) {
    console.error("Error updating category:", error);
    return { success: false, error: "Failed to update category" };
  }
}

// Delete category
export async function deleteCategory(id: string): Promise<ActionResponse<never>> {
  try {
    // 🔒 Require ADMIN role
    await requireAdmin();

    // Validate ID
    if (!id || typeof id !== "string") {
      return { success: false, error: "Invalid category ID" };
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    // Check if category has providers
    const providerCount = await prisma.provider.count({
      where: { categoryId: id },
    });

    if (providerCount > 0) {
      return { 
        success: false, 
        error: `Cannot delete category. ${providerCount} provider(s) are using this category.` 
      };
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/admin/category");
    return { success: true, data: undefined as never };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: "Failed to delete category" };
  }
}

// Get all categories
export async function getAllCategories(): Promise<ActionResponse<CategoryWithProviderCount[]>> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [
        { sortOrder: "asc" },
        { name: "asc" },
      ],
      include: {
        _count: {
          select: {
            providers: true,
          },
        },
      },
    });

    return { success: true, data: categories };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

// Get active categories only
export async function getActiveCategories(): Promise<ActionResponse<Category[]>> {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [
        { sortOrder: "asc" },
        { name: "asc" },
      ],
    });

    return { success: true, data: categories as Category[] };
  } catch (error) {
    console.error("Error fetching active categories:", error);
    return { success: false, error: "Failed to fetch active categories" };
  }
}

// Get category by ID
export async function getCategoryById(id: string): Promise<ActionResponse<CategoryWithProviderCount>> {
  try {
    if (!id || typeof id !== "string") {
      return { success: false, error: "Invalid category ID" };
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            providers: true,
          },
        },
      },
    });

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    return { success: true, data: category };
  } catch (error) {
    console.error("Error fetching category:", error);
    return { success: false, error: "Failed to fetch category" };
  }
}

// Get category by slug (public - no auth required)
export async function getCategoryBySlug(slug: string): Promise<ActionResponse<CategoryWithProviders>> {
  try {
    if (!slug || typeof slug !== "string") {
      return { success: false, error: "Invalid category slug" };
    }

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        providers: {
          where: { status: "VERIFIED" },
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    return { success: true, data: category as CategoryWithProviders };
  } catch (error) {
    console.error("Error fetching category by slug:", error);
    return { success: false, error: "Failed to fetch category" };
  }
}

// Toggle category status
export async function toggleCategoryStatus(id: string): Promise<ActionResponse<Category>> {
  try {
    // 🔒 Require ADMIN role
    await requireAdmin();

    if (!id || typeof id !== "string") {
      return { success: false, error: "Invalid category ID" };
    }

    const category = await prisma.category.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { isActive: !category.isActive },
    });

    revalidatePath("/admin/category");
    return { success: true, data: updatedCategory as Category };
  } catch (error) {
    console.error("Error toggling category status:", error);
    return { success: false, error: "Failed to toggle category status" };
  }
}

// Update category sort order
export async function updateCategorySortOrder(
  categories: { id: string; sortOrder: number }[]
): Promise<ActionResponse<never>> {
  try {
    // 🔒 Require ADMIN role
    await requireAdmin();

    if (!Array.isArray(categories) || categories.length === 0) {
      return { success: false, error: "Invalid categories array" };
    }

    await prisma.$transaction(
      categories.map((category) =>
        prisma.category.update({
          where: { id: category.id },
          data: { sortOrder: category.sortOrder },
        })
      )
    );

    revalidatePath("/admin/category");
    return { success: true, data: undefined as never };
  } catch (error) {
    console.error("Error updating category sort order:", error);
    return { success: false, error: "Failed to update sort order" };
  }
}