"use client";

import React from "react";
import Image from "next/image";
import type { ActiveUserData } from "@/actions/admin/analytics-actions";

interface ActiveUsersListProps {
  data: ActiveUserData[];
}

const ActiveUsersList: React.FC<ActiveUsersListProps> = ({ data }) => {
  const topUsers = data.slice(0, 10);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
          Most Active Patients
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Top users by appointment frequency
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {topUsers.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-slate-500 dark:text-slate-400">
            No active patients found for the selected period
          </div>
        ) : (
          <ul className="divide-y divide-slate-50 dark:divide-slate-700">
            {topUsers.map((user) => (
              <li
                key={user.id}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {user.avatar ? (
                      <Image
                        className="w-10 h-10 rounded-full object-cover"
                        src={user.avatar}
                        alt={user.name}
                        width={40}
                        height={40}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${
                        user.status === "Active" ? "bg-green-500" : "bg-slate-300"
                      }`}
                    ></span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-lg font-bold text-blue-600 dark:text-blue-400">
                    {user.appointments}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    Bookings
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {data.length > 10 && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 text-center">
          <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            View All Patients
          </button>
        </div>
      )}
    </div>
  );
};

export default ActiveUsersList;
