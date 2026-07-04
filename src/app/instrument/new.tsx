import { router } from "expo-router";

import { useCreateInstrument } from "@/features/instruments/hooks";
import {
  InstrumentForm,
  type InstrumentFormValues,
} from "@/features/instruments/instrument-form";

export default function NewInstrumentScreen() {
  const { mutate, isPending } = useCreateInstrument();

  function handleSubmit(values: InstrumentFormValues) {
    mutate(values, { onSuccess: () => router.back() });
  }

  return (
    <InstrumentForm
      submitLabel="Add Instrument"
      submitting={isPending}
      onSubmit={handleSubmit}
    />
  );
}
