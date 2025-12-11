"use client";

import { AuditLogTable } from "@/components/admin-components/settings";

export default function AuditLogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-muted-foreground">
          View all administrative actions performed on the platform
        </p>
      </div>

      <AuditLogTable />
    </div>
  );
}
