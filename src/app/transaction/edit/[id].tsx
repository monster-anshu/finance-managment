import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator } from "react-native";

import { Screen } from "@/components/screen";
import {
  useTransaction,
  useUpdateTransaction,
} from "@/features/transactions/hooks";
import {
  TransactionForm,
  type TransactionFormValues,
} from "@/features/transactions/transaction-form";
import { goBack } from "@/lib/navigation";

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const transactionId = Number(id);
  const { data: transaction, isPending } = useTransaction(transactionId);
  const { mutate, isPending: saving } = useUpdateTransaction();

  if (isPending || !transaction) {
    return (
      <Screen scroll={false}>
        <ActivityIndicator />
      </Screen>
    );
  }

  const { instrumentId } = transaction;

  function handleSubmit(values: TransactionFormValues) {
    mutate(
      { id: transactionId, input: values },
      { onSuccess: () => goBack(`/instrument/${instrumentId}`) }
    );
  }

  return (
    <TransactionForm
      initial={{
        kind: transaction.kind,
        pricePerUnit: String(transaction.pricePerUnit),
        quantity: String(transaction.quantity),
        date: transaction.date,
        note: transaction.note ?? "",
      }}
      submitLabel="Save Changes"
      submitting={saving}
      onSubmit={handleSubmit}
    />
  );
}
