"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    getAllCategories,
    getActiveCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    updateCategorySortOrder,
} from "@/actions/admin/create-category-actions";
import type {
    Category,
    CreateCategoryInput,
    UpdateCategoryInput,
    CategoryWithProviderCount
} from "@/schemas";
import { queryConfigDefaults } from "@/lib/query-keys";

// Query keys
export const categoryKeys = {
    all: ["categories"] as const,
    lists: () => [...categoryKeys.all, "list"] as const,
    list: (filters: string) => [...categoryKeys.lists(), { filters }] as const,
    details: () => [...categoryKeys.all, "detail"] as const,
    detail: (id: string) => [...categoryKeys.details(), id] as const,
    active: () => [...categoryKeys.all, "active"] as const,
};

// Get all categories hook - OPTIMIZED with queryConfigDefaults
export function useCategories() {
    return useQuery({
        queryKey: categoryKeys.lists(),
        queryFn: async () => {
            const result = await getAllCategories();
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        ...queryConfigDefaults.static, // Categories rarely change - use long cache
    });
}

// Get active categories hook - OPTIMIZED with queryConfigDefaults
export function useActiveCategories() {
    return useQuery({
        queryKey: categoryKeys.active(),
        queryFn: async () => {
            const result = await getActiveCategories();
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data as Category[];
        },
        ...queryConfigDefaults.static, // Categories rarely change - use long cache
    });
}

// Get category by ID hook - OPTIMIZED with queryConfigDefaults
export function useCategory(id: string) {
    return useQuery({
        queryKey: categoryKeys.detail(id),
        queryFn: async () => {
            const result = await getCategoryById(id);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        enabled: !!id,
        ...queryConfigDefaults.static,
    });
}

// Create category mutation
export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateCategoryInput) => {
            const result = await createCategory(data);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        onMutate: async (data: CreateCategoryInput) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: categoryKeys.lists() });
            
            // Snapshot previous value
            const previousCategories = queryClient.getQueryData(categoryKeys.lists());
            
            // Optimistically add new category with temporary ID
            queryClient.setQueryData(categoryKeys.lists(), (old: CategoryWithProviderCount[] | undefined) => {
                if (!old) return old;
                const optimisticCategory: CategoryWithProviderCount = {
                    id: `temp-${Date.now()}`,
                    name: data.name,
                    slug: data.slug,
                    description: data.description ?? null,
                    icon: data.icon ?? null,
                    color: data.color,
                    isActive: data.isActive,
                    sortOrder: data.sortOrder,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    _count: { providers: 0 },
                };
                return [...old, optimisticCategory];
            });
            
            return { previousCategories };
        },
        onError: (error: Error, variables, context) => {
            // Rollback on error
            if (context?.previousCategories) {
                queryClient.setQueryData(categoryKeys.lists(), context.previousCategories);
            }
            toast.error(error.message || "Failed to create category");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: categoryKeys.all });
            toast.success("Category created successfully");
        },
    });
}

// Update category mutation
export function useUpdateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateCategoryInput }) => {
            const result = await updateCategory(id, data);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        onMutate: async ({ id, data }) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: categoryKeys.lists() });
            
            // Snapshot previous value
            const previousCategories = queryClient.getQueryData(categoryKeys.lists());
            
            // Optimistically update
            queryClient.setQueryData(categoryKeys.lists(), (old: CategoryWithProviderCount[] | undefined) => {
                if (!old) return old;
                return old.map((cat) => 
                    cat.id === id ? { ...cat, ...data } : cat
                );
            });
            
            return { previousCategories };
        },
        onError: (error: Error, variables, context) => {
            // Rollback on error
            if (context?.previousCategories) {
                queryClient.setQueryData(categoryKeys.lists(), context.previousCategories);
            }
            toast.error(error.message || "Failed to update category");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: categoryKeys.all });
            toast.success("Category updated successfully");
        },
    });
}

// Delete category mutation
export function useDeleteCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const result = await deleteCategory(id);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result;
        },
        onMutate: async (id: string) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: categoryKeys.lists() });
            
            // Snapshot previous value
            const previousCategories = queryClient.getQueryData(categoryKeys.lists());
            
            // Optimistically remove
            queryClient.setQueryData(categoryKeys.lists(), (old: CategoryWithProviderCount[] | undefined) => {
                if (!old) return old;
                return old.filter((cat) => cat.id !== id);
            });
            
            return { previousCategories };
        },
        onError: (error: Error, variables, context) => {
            // Rollback on error
            if (context?.previousCategories) {
                queryClient.setQueryData(categoryKeys.lists(), context.previousCategories);
            }
            toast.error(error.message || "Failed to delete category");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: categoryKeys.all });
            toast.success("Category deleted successfully");
        },
    });
}

// Toggle category status mutation
export function useToggleCategoryStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const result = await toggleCategoryStatus(id);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        onMutate: async (id: string) => {
            // Cancel outgoing queries
            await queryClient.cancelQueries({ queryKey: categoryKeys.lists() });
            
            // Snapshot previous value
            const previousCategories = queryClient.getQueryData(categoryKeys.lists());
            
            // Optimistically toggle status
            queryClient.setQueryData(categoryKeys.lists(), (old: CategoryWithProviderCount[] | undefined) => {
                if (!old) return old;
                return old.map((cat) => 
                    cat.id === id ? { ...cat, isActive: !cat.isActive } : cat
                );
            });
            
            return { previousCategories };
        },
        onError: (error: Error, variables, context) => {
            // Rollback on error
            if (context?.previousCategories) {
                queryClient.setQueryData(categoryKeys.lists(), context.previousCategories);
            }
            toast.error(error.message || "Failed to update category status");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: categoryKeys.all });
            toast.success("Category status updated successfully");
        },
    });
}

// Update sort order mutation
export function useUpdateCategorySortOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (categories: { id: string; sortOrder: number }[]) => {
            const result = await updateCategorySortOrder(categories);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: categoryKeys.all });
            toast.success("Category order updated successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update category order");
        },
    });
}