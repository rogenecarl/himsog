"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type {
  PeakDayData,
  PeakHourData,
} from "@/actions/admin/analytics-actions";

interface PeakTimesChartProps {
  peakDays: PeakDayData[];
  peakHours: PeakHourData[];
}

const PeakTimesChart: React.FC<PeakTimesChartProps> = ({
  peakDays,
  peakHours,
}) => {
  const [view, setView] = useState<"days" | "hours">("days");

  const hasData =
    view === "days"
      ? peakDays.some((d) => d.bookings > 0)
      : peakHours.some((h) => h.bookings > 0);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            Peak Booking Times
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Useful for staff scheduling
          </p>
        </div>
        <div className="bg-slate-100 dark:bg-slate-700 p-1 rounded-lg flex text-sm">
          <button
            className={`px-4 py-1.5 rounded-md transition-all ${
              view === "days"
                ? "bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm font-medium"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
            onClick={() => setView("days")}
          >
            Days
          </button>
          <button
            className={`px-4 py-1.5 rounded-md transition-all ${
              view === "hours"
                ? "bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm font-medium"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
            onClick={() => setView("hours")}
          >
            Hours
          </button>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        {!hasData ? (
          <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
            No data available for the selected period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {view === "days" ? (
              <BarChart
                data={peakDays}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b" }}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    backgroundColor: "#fff",
                  }}
                />
                <Bar dataKey="bookings" radius={[6, 6, 0, 0]}>
                  {peakDays.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.bookings > 100 ? "#f59e0b" : "#94a3b8"}
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <LineChart
                data={peakHours}
                margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="hour"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  dy={10}
                  interval={1}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    backgroundColor: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#8b5cf6",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default PeakTimesChart;
