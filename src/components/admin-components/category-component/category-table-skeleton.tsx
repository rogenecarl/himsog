"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function CategoryTableSkeleton() {
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
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="px-4 xl:px-6 py-4">
                  <Skeleton className="h-5 w-32 bg-slate-200 dark:bg-white/10" />
                </TableCell>
                <TableCell className="px-4 xl:px-6 py-4">
                  <Skeleton className="h-4 w-28 bg-slate-200 dark:bg-white/10" />
                </TableCell>
                <TableCell className="px-4 xl:px-6 py-4">
                  <Skeleton className="h-4 w-16 bg-slate-200 dark:bg-white/10" />
                </TableCell>
                <TableCell className="px-4 xl:px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-6 h-6 rounded bg-slate-200 dark:bg-white/10" />
                    <Skeleton className="h-3 w-16 hidden xl:inline-block bg-slate-200 dark:bg-white/10" />
                  </div>
                </TableCell>
                <TableCell className="px-4 xl:px-6 py-4">
                  <Skeleton className="h-4 w-48 bg-slate-200 dark:bg-white/10" />
                </TableCell>
                <TableCell className="px-4 xl:px-6 py-4">
                  <Skeleton className="h-6 w-16 rounded-full bg-slate-200 dark:bg-white/10" />
                </TableCell>
                <TableCell className="px-4 xl:px-6 py-4">
                  <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-white/10" />
                </TableCell>
                <TableCell className="px-4 xl:px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-8 rounded bg-slate-200 dark:bg-white/10" />
                    <Skeleton className="h-8 w-8 rounded bg-slate-200 dark:bg-white/10" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View - Visible only on mobile/tablet */}
      <div className="lg:hidden space-y-4 p-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="bg-card border rounded-lg p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-5 w-32 bg-slate-200 dark:bg-white/10" />
                <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-white/10" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full bg-slate-200 dark:bg-white/10" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Skeleton className="h-3 w-12 bg-slate-200 dark:bg-white/10" />
                <Skeleton className="h-4 w-20 bg-slate-200 dark:bg-white/10" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-12 bg-slate-200 dark:bg-white/10" />
                <div className="flex items-center gap-2">
                  <Skeleton className="w-5 h-5 rounded bg-slate-200 dark:bg-white/10" />
                  <Skeleton className="h-3 w-16 bg-slate-200 dark:bg-white/10" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-3 w-20 bg-slate-200 dark:bg-white/10" />
              <Skeleton className="h-4 w-full bg-slate-200 dark:bg-white/10" />
              <Skeleton className="h-4 w-3/4 bg-slate-200 dark:bg-white/10" />
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <Skeleton className="h-3 w-24 bg-slate-200 dark:bg-white/10" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16 rounded bg-slate-200 dark:bg-white/10" />
                <Skeleton className="h-8 w-20 rounded bg-slate-200 dark:bg-white/10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
