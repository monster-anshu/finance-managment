import { useQuery } from '@tanstack/react-query';

import { listInstruments } from '@/db/repositories/instruments';
import { listAllTransactions } from '@/db/repositories/transactions';
import { summarizePortfolio, type PortfolioSummary } from '@/lib/aggregation';
import { queryKeys } from '@/lib/query';

async function loadSummary(): Promise<PortfolioSummary> {
  const [instruments, transactions] = await Promise.all([
    listInstruments(),
    listAllTransactions(),
  ]);
  return summarizePortfolio(instruments, transactions);
}

export function usePortfolioSummary() {
  return useQuery({ queryKey: queryKeys.summary, queryFn: loadSummary });
}
