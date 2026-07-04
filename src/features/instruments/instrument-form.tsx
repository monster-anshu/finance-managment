import { useState } from 'react';
import { Button, StyleSheet } from 'react-native';

import { LabeledField } from '@/components/labeled-field';
import { OptionPicker } from '@/components/option-picker';
import { Screen } from '@/components/screen';
import { ASSET_TYPES, ASSET_TYPE_LABELS, type AssetType } from '@/lib/types';
import {
  isValid,
  validateInstrument,
  type Errors,
  type InstrumentInput,
} from '@/lib/validation';

const typeOptions = ASSET_TYPES.map((value) => ({ value, label: ASSET_TYPE_LABELS[value] }));

export interface InstrumentFormValues {
  name: string;
  type: AssetType;
  description: string;
}

interface Props {
  initial?: InstrumentInput;
  submitLabel: string;
  submitting: boolean;
  onSubmit: (values: InstrumentFormValues) => void;
}

export function InstrumentForm({ initial, submitLabel, submitting, onSubmit }: Props) {
  const [input, setInput] = useState<InstrumentInput>(
    initial ?? { name: '', type: '', description: '' },
  );
  const [errors, setErrors] = useState<Errors<InstrumentInput>>({});

  function handleSubmit() {
    const nextErrors = validateInstrument(input);
    setErrors(nextErrors);
    if (!isValid(nextErrors)) return;
    onSubmit({ name: input.name.trim(), type: input.type as AssetType, description: input.description.trim() });
  }

  return (
    <Screen>
      <LabeledField
        label="Name"
        value={input.name}
        onChangeText={(name) => setInput((s) => ({ ...s, name }))}
        placeholder="e.g. HDFC Nifty 50 ETF"
        error={errors.name}
      />
      <OptionPicker
        label="Type"
        options={typeOptions}
        value={input.type}
        onChange={(type) => setInput((s) => ({ ...s, type }))}
        error={errors.type}
      />
      <LabeledField
        label="Description (optional)"
        value={input.description}
        onChangeText={(description) => setInput((s) => ({ ...s, description }))}
        placeholder="Notes about this holding"
        multiline
        style={styles.multiline}
      />
      <Button title={submitLabel} onPress={handleSubmit} disabled={submitting} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  multiline: { minHeight: 80, textAlignVertical: 'top' },
});
