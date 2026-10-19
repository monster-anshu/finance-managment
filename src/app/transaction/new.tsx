import { useLocalSearchParams } from "expo-router";

import { useCreateTransaction } from "@/features/transactions/hooks";
import {
  TransactionForm,
  type TransactionFormValues,
} from "@/features/transactions/transaction-form";
import { goBack } from "@/lib/navigation";

export default function NewTransactionScreen() {
  const { instrumentId } = useLocalSearchParams<{ instrumentId: string }>();
  const id = Number(instrumentId);
  const { mutate, isPending } = useCreateTransaction();

  function handleSubmit(values: TransactionFormValues) {
    mutate(
      { ...values, instrumentId: id },
      { onSuccess: () => goBack(`/instrument/${id}`) }
    );
  }

  return (
    <TransactionForm
      submitLabel="Add Buy"
      submitting={isPending}
      onSubmit={handleSubmit}
    />
  );
}
