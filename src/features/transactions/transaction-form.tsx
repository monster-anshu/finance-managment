import { useState } from "react";
import { Button, Pressable, StyleSheet } from "react-native";

import { DateField } from "@/components/date-field";
import { LabeledField } from "@/components/labeled-field";
import { OptionPicker } from "@/components/option-picker";
import { Screen } from "@/components/screen";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { TX_KINDS, TX_KIND_LABELS, type TxKind } from "@/lib/types";
import {
  isValid,
  validateTransaction,
  type Errors,
  type TransactionInput,
} from "@/lib/validation";

const kindOptions = TX_KINDS.map((value) => ({
  value,
  label: TX_KIND_LABELS[value],
}));

export interface TransactionFormValues {
  kind: TxKind;
  pricePerUnit: number;
  quantity: number;
  date: number;
  note: string | null;
}

interface Props {
  initial?: TransactionInput;
  submitLabel: string;
  submitting: boolean;
  onSubmit: (values: TransactionFormValues) => void;
}

export function TransactionForm({
  initial,
  submitLabel,
  submitting,
  onSubmit,
}: Props) {
  const [input, setInput] = useState<TransactionInput>(
    () =>
      initial ?? {
        kind: "",
        pricePerUnit: "",
        quantity: "",
        date: Date.now(),
        note: "",
      }
  );
  const [errors, setErrors] = useState<Errors<TransactionInput>>({});

  function incrementQuantity() {
    setInput((s) => {
      const current = Number(s.quantity);
      const next = Number.isFinite(current) ? current + 1 : 1;
      return { ...s, quantity: String(next) };
    });
  }

  function handleSubmit() {
    const nextErrors = validateTransaction(input);
    setErrors(nextErrors);
    if (!isValid(nextErrors)) return;
    onSubmit({
      kind: input.kind as TxKind,
      pricePerUnit: Number(input.pricePerUnit),
      quantity: Number(input.quantity),
      date: input.date as number,
      note: input.note.trim() ? input.note.trim() : null,
    });
  }

  return (
    <Screen>
      <OptionPicker
        label="Kind"
        options={kindOptions}
        value={input.kind}
        onChange={(kind) => setInput((s) => ({ ...s, kind }))}
        error={errors.kind}
      />
      <LabeledField
        label="Price per unit (₹)"
        value={input.pricePerUnit}
        onChangeText={(pricePerUnit) =>
          setInput((s) => ({ ...s, pricePerUnit }))
        }
        keyboardType="decimal-pad"
        placeholder="0.00"
        error={errors.pricePerUnit}
      />
      <LabeledField
        label="Quantity (units)"
        value={input.quantity}
        onChangeText={(quantity) => setInput((s) => ({ ...s, quantity }))}
        keyboardType="decimal-pad"
        placeholder="0"
        error={errors.quantity}
        rightAdornment={
          <Pressable
            onPress={incrementQuantity}
            accessibilityRole="button"
            accessibilityLabel="Increment quantity"
          >
            <ThemedView type="backgroundSelected" style={styles.stepper}>
              <ThemedText type="subtitle">+</ThemedText>
            </ThemedView>
          </Pressable>
        }
      />

      <DateField
        label="Date"
        value={input.date}
        onChange={(date) => setInput((s) => ({ ...s, date }))}
        error={errors.date}
      />

      <LabeledField
        label="Note (optional)"
        value={input.note}
        onChangeText={(note) => setInput((s) => ({ ...s, note }))}
        placeholder="e.g. monthly SIP installment"
      />

      <Button
        title={submitLabel}
        onPress={handleSubmit}
        disabled={submitting}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  stepper: {
    width: 48,
    height: 48,
    borderRadius: Spacing.two,
    alignItems: "center",
    justifyContent: "center",
  },
});
