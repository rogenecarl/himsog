"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface PeakHoursChartProps {
  data: Array<{
    hour: string;
    appointments: number;
  }>;
}

const chartConfig = {
  appointments: {
    label: "Appointments",
    color: "var(--chart-1)",
  },
  label: {
    color: "var(--background)",
  },
} satisfies ChartConfig;

export function PeakHoursChart({ data }: PeakHoursChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>Peak Hours</CardTitle>
            <CardDescription>When you are busiest</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="h-[250px] flex items-center justify-center">
            <p className="text-muted-foreground">No peak hours data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Convert 24-hour format to 12-hour AM/PM format
  const formatHourTo12Hour = (hour: string) => {
    const hourNum = parseInt(hour.split(":")[0]);
    if (hourNum === 0) return "12 AM";
    if (hourNum < 12) return `${hourNum} AM`;
    if (hourNum === 12) return "12 PM";
    return `${hourNum - 12} PM`;
  };

  const chartData = data.map((item) => ({
    time: formatHourTo12Hour(item.hour),
    appointments: item.appointments,
  }));

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Peak Hours</CardTitle>
          <CardDescription>When you are busiest</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              right: 16,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="time"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              hide
            />
            <XAxis dataKey="appointments" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="appointments"
              layout="vertical"
              fill="var(--color-appointments)"
              radius={4}
            >
              <LabelList
                dataKey="time"
                position="insideLeft"
                offset={8}
                className="fill-white"
                fontSize={12}
              />
              <LabelList
                dataKey="appointments"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
