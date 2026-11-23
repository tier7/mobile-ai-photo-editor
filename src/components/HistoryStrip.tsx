import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { HistoryEntry } from '../storage/history';

type Props = {
  entries: HistoryEntry[];
  onOpen: (entry: HistoryEntry) => void;
  onClear: () => void;
};

export function HistoryStrip({ entries, onOpen, onClear }: Props) {
  if (entries.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="time-outline" size={17} color="#e2e8f0" />
          <Text style={styles.title}>Historia</Text>
          <Text style={styles.count}>{entries.length}</Text>
        </View>
        <TouchableOpacity onPress={onClear} hitSlop={10} style={styles.clear}>
          <Ionicons name="trash-outline" size={15} color="#94a3b8" />
          <Text style={styles.clearText}>Wyczyść</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.list}
      >
        {entries.map((entry) => (
          <TouchableOpacity key={entry.id} onPress={() => onOpen(entry)} activeOpacity={0.8}>
            <Image source={{ uri: entry.after }} style={styles.thumb} />
            <Text style={styles.caption} numberOfLines={1}>
              {entry.style ?? 'Własny prompt'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '700',
  },
  count: {
    color: '#64748b',
    fontSize: 13,
  },
  clear: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  scroll: {
    marginHorizontal: -20,
  },
  list: {
    paddingHorizontal: 20,
    gap: 10,
  },
  thumb: {
    width: 96,
    height: 96,
    borderRadius: 12,
    backgroundColor: '#1e293b',
  },
  caption: {
    width: 96,
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 6,
  },
});
