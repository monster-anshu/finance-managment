import { router } from 'expo-router';

import { InstrumentForm, type InstrumentFormValues } from '@/features/instruments/instrument-form';
import { useCreateInstrument } from '@/features/instruments/hooks';

export default function NewInstrumentScreen() {
  const { mutate, isPending } = useCreateInstrument();

  function handleSubmit(values: InstrumentFormValues) {
    mutate(values, { onSuccess: () => router.back() });
  }

  return <InstrumentForm submitLabel="Add Instrument" submitting={isPending} onSubmit={handleSubmit} />;
}
