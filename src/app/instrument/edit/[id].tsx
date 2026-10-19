import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator } from "react-native";

import { Screen } from "@/components/screen";
import {
  useInstrument,
  useUpdateInstrument,
} from "@/features/instruments/hooks";
import {
  InstrumentForm,
  type InstrumentFormValues,
} from "@/features/instruments/instrument-form";
import { goBack } from "@/lib/navigation";

export default function EditInstrumentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const instrumentId = Number(id);
  const { data: instrument, isPending } = useInstrument(instrumentId);
  const { mutate, isPending: saving } = useUpdateInstrument();

  if (isPending || !instrument) {
    return (
      <Screen scroll={false}>
        <ActivityIndicator />
      </Screen>
    );
  }

  function handleSubmit(values: InstrumentFormValues) {
    mutate(
      { id: instrumentId, input: values },
      { onSuccess: () => goBack(`/instrument/${instrumentId}`) }
    );
  }

  return (
    <InstrumentForm
      initial={{
        name: instrument.name,
        type: instrument.type,
        description: instrument.description ?? "",
      }}
      submitLabel="Save Changes"
      submitting={saving}
      onSubmit={handleSubmit}
    />
  );
}
