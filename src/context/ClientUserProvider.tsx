"use client";

import { useMemo } from "react";
import { UserContext } from "./UserContext";
import { authClient } from "@/lib/auth-client";
import type { User } from "@/schemas";

export function ClientUserProvider({ children }: { children: React.ReactNode }) {
  // useSession has built-in caching and deduplication
  // Session automatically updates after authClient.signIn/signOut
  const { data: session, isPending } = authClient.useSession();

  const contextValue = useMemo(() => ({
    user: session?.user as User | null,
    setUser: () => {}, // Session is managed by authClient, manual setUser not needed
    isPending,
  }), [session?.user, isPending]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}
