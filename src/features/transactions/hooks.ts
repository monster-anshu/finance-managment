import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createTransaction,
  deleteTransaction,
  getTransaction,
  listAllTransactions,
  listTransactionsByInstrument,
  updateTransaction,
} from "@/db/repositories/transactions";
import type { NewTransaction, Transaction } from "@/db/schema";
import { queryKeys } from "@/lib/query";

type TransactionFields = Omit<NewTransaction, "id" | "createdAt" | "updatedAt">;

export function useAllTransactions() {
  return useQuery({
    queryKey: queryKeys.allTransactions,
    queryFn: listAllTransactions,
  });
}

export function useTransactionsByInstrument(instrumentId: number) {
  return useQuery({
    queryKey: queryKeys.transactions(instrumentId),
    queryFn: () => listTransactionsByInstrument(instrumentId),
  });
}

export function useTransaction(id: number) {
  return useQuery({
    queryKey: queryKeys.transaction(id),
    queryFn: () => getTransaction(id),
  });
}

function invalidateForInstrument(
  qc: ReturnType<typeof useQueryClient>,
  instrumentId: number
): void {
  qc.invalidateQueries({ queryKey: queryKeys.transactions(instrumentId) });
  qc.invalidateQueries({ queryKey: queryKeys.allTransactions });
  qc.invalidateQueries({ queryKey: queryKeys.instruments });
  qc.invalidateQueries({ queryKey: queryKeys.instrument(instrumentId) });
  qc.invalidateQueries({ queryKey: queryKeys.summary });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TransactionFields) => createTransaction(input),
    onSuccess: (row: Transaction) =>
      invalidateForInstrument(qc, row.instrumentId),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: Partial<TransactionFields>;
    }) => updateTransaction(id, input),
    onSuccess: (row: Transaction) => {
      qc.invalidateQueries({ queryKey: queryKeys.transaction(row.id) });
      invalidateForInstrument(qc, row.instrumentId);
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number; instrumentId: number }) =>
      deleteTransaction(id),
    onSuccess: (_data, variables) =>
      invalidateForInstrument(qc, variables.instrumentId),
  });
}
