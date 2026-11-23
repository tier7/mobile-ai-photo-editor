import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { isPresetReady, Preset, PRESETS } from '../presets';

type Props = {
  selected: Preset | null;
  onSelect: (preset: Preset | null) => void;
  disabled?: boolean;
};

export function PresetPicker({ selected, onSelect, disabled }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      style={styles.scroll}
    >
      {PRESETS.map((preset) => {
        const active = selected?.id === preset.id;
        const ready = isPresetReady(preset);
        return (
          <TouchableOpacity
            key={preset.id}
            style={[styles.chip, active && styles.chipActive, !ready && styles.chipDraft]}
            onPress={() => onSelect(active ? null : preset)}
            disabled={disabled}
            activeOpacity={0.8}
          >
            {!ready && <Ionicons name="lock-closed-outline" size={13} color="#64748b" />}
            <Text style={[styles.label, active && styles.labelActive]}>{preset.name}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginHorizontal: -20,
    marginBottom: 16,
  },
  list: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipActive: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  chipDraft: {
    borderStyle: 'dashed',
  },
  label: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
  },
  labelActive: {
    color: '#f8fafc',
  },
});
