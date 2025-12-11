"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveCategories } from "@/hooks/use-category";
import { cn } from "@/lib/utils";
import { memo } from "react";

interface CategoryFilterMapProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  providerCounts?: Record<string, number>;
  className?: string;
}

const CategoryFilterMap = memo(function CategoryFilterMap({
  selectedCategory,
  onCategoryChange,
  className,
}: CategoryFilterMapProps) {
  const { data: categories = [], isLoading, error } = useActiveCategories();

  if (isLoading) {
    return (
      <div className={cn("flex flex-row gap-3", className)}>
        {/* Individual Category Skeletons */}
        <Skeleton className="h-10 w-24 bg-slate-200 dark:bg-white/10 rounded-full" />
        <Skeleton className="h-10 w-28 bg-slate-200 dark:bg-white/10 rounded-full" />
        <Skeleton className="h-10 w-20 bg-slate-200 dark:bg-white/10 rounded-full" />
        <Skeleton className="h-10 w-26 bg-slate-200 dark:bg-white/10 rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("", className)}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg px-4 py-2">
          <p className="text-sm text-red-600 dark:text-red-400">Failed to load categories</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-row gap-2 md:gap-3", className)}>
      {/* "All" Button - Mobile Only */}
      <Button
        variant={!selectedCategory ? "default" : "outline"}
        onClick={() => onCategoryChange("")}
        className={cn(
          "gap-2 h-10 rounded-full shadow-sm transition-all duration-200 shrink-0 md:hidden",
          !selectedCategory
            ? "text-white hover:opacity-90 bg-blue-600 dark:bg-cyan-600 border-blue-600 dark:border-cyan-600"
            : "bg-white dark:bg-slate-800 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
        )}
        title="Show all categories"
      >
        All
      </Button>

      {/* Individual Category Buttons with Toggle Behavior */}
      {categories.map((category) => {
        const isSelected = selectedCategory === category.slug;
        
        const handleClick = () => {
          // Toggle behavior: if already selected, deselect (return to "")
          if (isSelected) {
            onCategoryChange("");
          } else {
            onCategoryChange(category.slug);
          }
        };
        
        return (
          <Button
            key={category.id}
            variant={isSelected ? "default" : "outline"}
            onClick={handleClick}
            className={cn(
              "gap-2 h-10 rounded-full shadow-sm transition-all duration-200 shrink-0 whitespace-nowrap",
              isSelected
                ? "text-white hover:opacity-90"
                : "bg-white dark:bg-slate-800 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
            )}
            style={{
              backgroundColor: isSelected ? "#155e75" : undefined,
              borderColor: isSelected ? "#155e75" : undefined,
              color: isSelected ? "white" : undefined
            }}
            title={isSelected ? `Remove ${category.name} filter` : `Filter by ${category.name}`}
          >
            <span>{category.icon || "🏥"}</span>
            <span className="sm:inline md:inline">{category.name}</span>
          </Button>
        );
      })}
    </div>
  );
});

export default CategoryFilterMap;