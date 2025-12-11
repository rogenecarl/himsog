"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  LabelList,
  TooltipProps,
} from "recharts";
import type { TopProviderData } from "@/actions/admin/analytics-actions";

interface TopProvidersChartProps {
  data: TopProviderData[];
}

// Gradient colors from darkest (rank 1) to lightest (rank 5)
const RANK_COLORS = [
  "#4f46e5", // indigo-600 - #1 (top performer)
  "#6366f1", // indigo-500 - #2
  "#818cf8", // indigo-400 - #3
  "#a5b4fc", // indigo-300 - #4
  "#c7d2fe", // indigo-200 - #5
];

// Custom tooltip component with full provider name
const CustomTooltip = ({
  active,
  payload,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as TopProviderData & { displayName: string };
    return (
      <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
        <p className="font-semibold text-slate-800 dark:text-white text-sm mb-1">
          {data.name}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {data.bookings}
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            bookings
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const TopProvidersChart: React.FC<TopProvidersChartProps> = ({ data }) => {
  // Truncate long names for display on Y-axis
  const chartData = data.map((provider) => ({
    ...provider,
    displayName:
      provider.name.length > 20
        ? provider.name.substring(0, 20) + "..."
        : provider.name,
  }));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-[400px]">
      <div className="px-5 pt-5 pb-3">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
          Top 5 Providers (Bookings)
        </h3>
      </div>

      <div className="flex-1 w-full min-h-0 pr-3 pb-4">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
            No data available for the selected period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#f1f5f9"
              />
              <XAxis type="number" hide />
              <YAxis
                dataKey="displayName"
                type="category"
                axisLine={false}
                tickLine={false}
                width={150}
                tick={{ fill: "#475569", fontSize: 13, fontWeight: 500 }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(99, 102, 241, 0.08)" }}
              />
              <Bar dataKey="bookings" barSize={32} radius={[0, 6, 6, 0]}>
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={RANK_COLORS[index] || RANK_COLORS[RANK_COLORS.length - 1]}
                  />
                ))}
                <LabelList
                  dataKey="bookings"
                  position="right"
                  fill="#64748b"
                  fontSize={12}
                  fontWeight={600}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default TopProvidersChart;
