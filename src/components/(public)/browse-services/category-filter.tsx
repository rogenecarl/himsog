"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveCategories } from "@/hooks/use-category";
import { useState, useRef, useEffect, memo } from "react";

interface ServiceCategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter = memo(function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: ServiceCategoryFilterProps) {
  const { data: categories = [], isLoading, error } = useActiveCategories();
  const [, setShowScrollButtons] = useState(false);
  const [, setCanScrollLeft] = useState(false);
  const [, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Check scroll state
  const checkScrollState = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
      setShowScrollButtons(scrollWidth > clientWidth);
    }
  };

  useEffect(() => {
    checkScrollState();
    const handleResize = () => checkScrollState();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [categories]);

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        {/* Mobile skeleton */}
        <div className="flex sm:hidden flex-wrap gap-2 justify-center px-4">
          <Skeleton className="h-8 w-20 bg-slate-200 dark:bg-white/10 rounded-full" />
          <Skeleton className="h-8 w-16 bg-slate-200 dark:bg-white/10 rounded-full" />
          <Skeleton className="h-8 w-18 bg-slate-200 dark:bg-white/10 rounded-full" />
          <Skeleton className="h-8 w-14 bg-slate-200 dark:bg-white/10 rounded-full" />
        </div>

        {/* Desktop skeleton */}
        <div className="hidden sm:flex flex-wrap gap-2 sm:gap-3 justify-center">
          <Skeleton className="h-9 sm:h-10 w-28 sm:w-32 bg-slate-200 dark:bg-white/10 rounded-full" />
          <Skeleton className="h-9 sm:h-10 w-20 sm:w-24 bg-slate-200 dark:bg-white/10 rounded-full" />
          <Skeleton className="h-9 sm:h-10 w-24 sm:w-28 bg-slate-200 dark:bg-white/10 rounded-full" />
          <Skeleton className="h-9 sm:h-10 w-18 sm:w-20 bg-slate-200 dark:bg-white/10 rounded-full" />
          <Skeleton className="h-9 sm:h-10 w-22 sm:w-26 bg-slate-200 dark:bg-white/10 rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="text-center py-4">
          <p className="text-sm text-red-600 dark:text-red-400">Failed to load categories</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Single line horizontal scroll for all screen sizes */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide px-4 py-2 scroll-smooth"
        onScroll={checkScrollState}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* All Categories Button */}
        <Button
          variant={selectedCategory === "" ? "default" : "outline"}
          onClick={() => onCategoryChange("")}
          className="shrink-0 gap-1.5 sm:gap-2 h-9 sm:h-10 px-4 sm:px-6 text-sm font-medium rounded-full sm:rounded-xl transition-all duration-200 whitespace-nowrap border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 hover:scale-105 active:scale-95 cursor-pointer"
          style={{
            backgroundColor: selectedCategory === "" ? "#0891b2" : undefined,
            color: selectedCategory === "" ? "white" : undefined,
            borderColor: selectedCategory === "" ? "#0891b2" : undefined,
            boxShadow:
              selectedCategory === ""
                ? "0 4px 12px rgba(8, 145, 178, 0.25)"
                : "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <span className="hidden sm:inline text-base">🏥</span>
          <span className="sm:hidden">All</span>
          <span className="hidden sm:inline">All Categories</span>
        </Button>

        {/* Individual Category Buttons */}
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.slug ? "default" : "outline"}
            onClick={() => onCategoryChange(category.slug)}
            className="shrink-0 gap-1.5 sm:gap-2 h-9 sm:h-10 px-4 sm:px-6 text-sm font-medium rounded-full sm:rounded-xl transition-all duration-200 whitespace-nowrap border-slate-300 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 hover:scale-105 active:scale-95 cursor-pointer"
            style={{
              backgroundColor:
                selectedCategory === category.slug ? "#0891b2" : undefined,
              color: selectedCategory === category.slug ? "white" : undefined,
              borderColor:
                selectedCategory === category.slug ? "#0891b2" : undefined,
              boxShadow:
                selectedCategory === category.slug
                  ? "0 4px 12px rgba(8, 145, 178, 0.25)"
                  : "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <span className="hidden sm:inline text-base">{category.icon || "🏥"}</span>
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
});

export default CategoryFilter;
