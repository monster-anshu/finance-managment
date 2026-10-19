import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import type { ReactNode } from "react";

import { DatabaseGateView } from "@/components/database-gate-view";
import { db } from "@/db/client";
import migrations from "@/db/drizzle/migrations";

export function MigrationGate({ children }: { children: ReactNode }) {
  const { success, error } = useMigrations(db, migrations);
  return (
    <DatabaseGateView ready={success} error={error}>
      {children}
    </DatabaseGateView>
  );
}
