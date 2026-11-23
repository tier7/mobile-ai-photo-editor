import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import type { Step } from '../api/wavespeed';

const LABELS: Record<Step, string> = {
  upload: 'Wysyłanie zdjęcia',
  submit: 'Zlecanie stylizacji',
  processing: 'AI przerabia zdjęcie',
};

const ORDER: Step[] = ['upload', 'submit', 'processing'];

export function GenerationStatus({ step }: { step: Step }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const current = ORDER.indexOf(step);

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <ActivityIndicator color="#10b981" />
        <Text style={styles.label}>{LABELS[step]}…</Text>
        <Text style={styles.time}>{seconds} s</Text>
      </View>
      <View style={styles.progress}>
        {ORDER.map((s, i) => (
          <View key={s} style={[styles.segment, i <= current && styles.segmentActive]} />
        ))}
      </View>
      <Text style={styles.hint}>Zwykle trwa to od kilkunastu sekund do minuty.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
  },
  time: {
    color: '#94a3b8',
    fontVariant: ['tabular-nums'],
  },
  progress: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 14,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
  },
  segmentActive: {
    backgroundColor: '#10b981',
  },
  hint: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 10,
  },
});
