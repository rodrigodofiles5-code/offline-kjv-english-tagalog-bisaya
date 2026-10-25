import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Keyboard,
} from 'react-native';
import { router } from 'expo-router';
import { Search, X } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { useTheme } from '@/contexts/theme';
import { searchAll, SearchResult } from '@/data/bibleData';

export default function SearchScreen() {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);

  const onSearch = useCallback((q: string) => {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setResults(searchAll(q));
    setSearched(true);
  }, []);

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    const key = `${r.book}|${r.chapter}|${r.verse}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});
  const groups = Object.values(grouped);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Search" subtitle="EN • TL • CEB" />

      <View style={styles.searchRow}>
        <View
          style={[
            styles.inputWrap,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Search size={20} color={theme.textMuted} />
          <TextInput
            value={query}
            onChangeText={onSearch}
            placeholder="Keyword or e.g. John 3:16"
            placeholderTextColor={theme.textMuted}
            style={[styles.input, { color: theme.text }]}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQuery('');
                setResults([]);
                setSearched(false);
              }}
            >
              <X size={20} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item, idx) => `${item[0].book}-${item[0].chapter}-${item[0].verse}-${idx}`}
        contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const head = item[0];
          return (
            <TouchableOpacity
              style={[
                styles.resultCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
              onPress={() => {
                Keyboard.dismiss();
                router.push(
                  `/verses?book=${encodeURIComponent(head.book)}&chapter=${head.chapter}&verse=${head.verse}`
                );
              }}
            >
              <Text style={[styles.refText, { color: theme.primary }]}>
                {head.book} {head.chapter}:{head.verse}
              </Text>
              {item.map((r) => (
                <View key={r.code} style={styles.resultRow}>
                  <Text style={[styles.tag, styles[`tag_${r.code}` as keyof typeof styles]]}>
                    {r.code.toUpperCase()}
                  </Text>
                  <Text
                    style={[styles.resultText, { color: theme.text }]}
                    numberOfLines={3}
                  >
                    {r.text}
                  </Text>
                </View>
              ))}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              {!searched
                ? 'Search across all three KJV translations. Try "love", "God", or "John 3:16".'
                : 'No matches found. Try another word or reference.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchRow: {
    padding: 12,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  resultCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  refText: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  resultRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  resultText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  tag: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 3,
  },
  tag_en: { backgroundColor: '#1e4d8b' },
  tag_tl: { backgroundColor: '#2e7d4f' },
  tag_ceb: { backgroundColor: '#b07d2e' },
  empty: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
});
