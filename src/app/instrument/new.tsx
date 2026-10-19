import { useCreateInstrument } from "@/features/instruments/hooks";
import {
  InstrumentForm,
  type InstrumentFormValues,
} from "@/features/instruments/instrument-form";
import { goBack } from "@/lib/navigation";

export default function NewInstrumentScreen() {
  const { mutate, isPending } = useCreateInstrument();

  function handleSubmit(values: InstrumentFormValues) {
    mutate(values, { onSuccess: () => goBack("/portfolio") });
  }

  return (
    <InstrumentForm
      submitLabel="Add Instrument"
      submitting={isPending}
      onSubmit={handleSubmit}
    />
  );
}
