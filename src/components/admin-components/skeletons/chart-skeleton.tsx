import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32 bg-slate-200 dark:bg-white/10" />
        <Skeleton className="h-4 w-48 bg-slate-200 dark:bg-white/10" />
      </CardHeader>
      <CardContent>
        <Skeleton className="w-full bg-slate-200 dark:bg-white/10" style={{ height }} />
      </CardContent>
    </Card>
  );
}

export function PieChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32 bg-slate-200 dark:bg-white/10" />
        <Skeleton className="h-4 w-48 bg-slate-200 dark:bg-white/10" />
      </CardHeader>
      <CardContent className="flex items-center justify-center py-4">
        <Skeleton className="h-[200px] w-[200px] rounded-full bg-slate-200 dark:bg-white/10" />
      </CardContent>
    </Card>
  );
}

// Fixed heights for bar chart skeleton to avoid impure Math.random in render
const BAR_HEIGHTS = ["65%", "80%", "45%", "90%", "55%", "70%", "85%"];

export function BarChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32 bg-slate-200 dark:bg-white/10" />
        <Skeleton className="h-4 w-48 bg-slate-200 dark:bg-white/10" />
      </CardHeader>
      <CardContent className="flex items-end gap-2" style={{ height }}>
        {BAR_HEIGHTS.map((barHeight, i) => (
          <Skeleton
            key={i}
            className="flex-1 bg-slate-200 dark:bg-white/10"
            style={{ height: barHeight }}
          />
        ))}
      </CardContent>
    </Card>
  );
}
