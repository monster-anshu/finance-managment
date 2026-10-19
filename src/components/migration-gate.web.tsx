import { useEffect, useState, type ReactNode } from "react";

import { DatabaseGateView } from "@/components/database-gate-view";
import { indexedDb } from "@/db/indexeddb/client";

// Opening the Dexie database runs any pending IndexedDB migrations
// (src/db/indexeddb/migrations.ts).
export function MigrationGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    // Ask the browser not to evict our data under storage pressure.
    void navigator.storage?.persist?.();
    indexedDb.open().then(
      () => setReady(true),
      (reason: unknown) =>
        setError(reason instanceof Error ? reason : new Error(String(reason)))
    );
  }, []);

  return (
    <DatabaseGateView ready={ready} error={error}>
      {children}
    </DatabaseGateView>
  );
}
