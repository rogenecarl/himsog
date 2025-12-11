"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card } from "@/components/ui/card";

interface StatusDistributionChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

const CardHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="p-6 border-b border-gray-100 dark:border-white/10">
    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{title}</h3>
    {subtitle && <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{subtitle}</p>}
  </div>
);

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
        <CardHeader title="Booking Status" subtitle="Outcome breakdown." />
        <div className="p-6 h-[250px] flex items-center justify-center">
          <p className="text-gray-500 dark:text-slate-400">No status data available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
      <CardHeader title="Booking Status" subtitle="Outcome breakdown." />
      <div className="p-6 h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={50}
              outerRadius={70}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                backgroundColor: "white",
              }}
            />
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ fontSize: "12px" }}
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
