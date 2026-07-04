import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createInstrument,
  deleteInstrument,
  getInstrument,
  listInstruments,
  updateInstrument,
} from '@/db/repositories/instruments';
import type { Instrument, NewInstrument } from '@/db/schema';
import { queryKeys } from '@/lib/query';

type InstrumentFields = Omit<NewInstrument, 'id' | 'createdAt' | 'updatedAt'>;

export function useInstruments() {
  return useQuery({ queryKey: queryKeys.instruments, queryFn: listInstruments });
}

export function useInstrument(id: number) {
  return useQuery({
    queryKey: queryKeys.instrument(id),
    queryFn: () => getInstrument(id),
  });
}

export function useCreateInstrument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InstrumentFields) => createInstrument(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.instruments });
      qc.invalidateQueries({ queryKey: queryKeys.summary });
    },
  });
}

export function useUpdateInstrument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<InstrumentFields> }) =>
      updateInstrument(id, input),
    onSuccess: (row: Instrument) => {
      qc.invalidateQueries({ queryKey: queryKeys.instruments });
      qc.invalidateQueries({ queryKey: queryKeys.instrument(row.id) });
      qc.invalidateQueries({ queryKey: queryKeys.summary });
    },
  });
}

export function useDeleteInstrument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteInstrument(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.instruments });
      qc.invalidateQueries({ queryKey: queryKeys.summary });
      qc.invalidateQueries({ queryKey: queryKeys.allTransactions });
    },
  });
}
