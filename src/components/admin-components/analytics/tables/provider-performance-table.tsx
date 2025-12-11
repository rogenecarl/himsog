"use client";

import React from "react";
import Image from "next/image";
import { Star, Clock, CheckCircle, XCircle } from "lucide-react";
import type { ProviderPerformanceData } from "@/actions/admin/analytics-actions";

interface ProviderPerformanceTableProps {
  data: ProviderPerformanceData[];
}

const ProviderPerformanceTable: React.FC<ProviderPerformanceTableProps> = ({
  data,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
          Provider Performance Summary
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Key performance indicators per provider
        </p>
      </div>

      <div className="overflow-x-auto">
        {data.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-slate-500 dark:text-slate-400">
            No provider performance data available for the selected period
          </div>
        ) : (
          <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">
                  Provider
                </th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">
                  Completed
                </th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">
                  Cancelled
                </th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">
                  Rating
                </th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">
                  Avg Duration
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((provider) => (
                <tr
                  key={provider.id}
                  className="bg-white dark:bg-slate-800 border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <td className="px-6 py-4 flex items-center gap-3">
                    {provider.avatar ? (
                      <Image
                        className="w-8 h-8 rounded-full object-cover"
                        src={provider.avatar}
                        alt={provider.name}
                        width={32}
                        height={32}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs font-medium">
                        {provider.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium text-slate-800 dark:text-white">
                      {provider.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-md text-xs font-medium">
                      <CheckCircle size={14} />
                      {provider.completed}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2.5 py-1 rounded-md text-xs font-medium">
                      <XCircle size={14} />
                      {provider.cancelled}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                      <Star
                        size={16}
                        className="fill-yellow-400 text-yellow-400"
                      />
                      {provider.rating > 0 ? provider.rating.toFixed(1) : "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400">
                      <Clock size={16} />
                      {provider.avgDuration > 0
                        ? `${provider.avgDuration} min`
                        : "N/A"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProviderPerformanceTable;
