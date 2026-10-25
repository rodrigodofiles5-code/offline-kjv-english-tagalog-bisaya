import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Header } from '@/components/Header';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useTheme } from '@/contexts/theme';
import { getBooks } from '@/data/bibleData';
import { BibleBook } from '@/types/bible';

type Stage = 'testament' | 'books' | 'chapters';

export default function HomeScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ testament?: 'OT' | 'NT' }>();
  const [stage, setStage] = useState<Stage>(params.testament ? 'books' : 'testament');
  const [testament, setTestament] = useState<'OT' | 'NT' | null>(params.testament ?? null);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);

  const onPickTestament = (t: 'OT' | 'NT') => {
    setTestament(t);
    setStage('books');
  };

  const onPickBook = (book: BibleBook) => {
    setSelectedBook(book);
    setStage('chapters');
  };

  const onPickChapter = (chapter: number) => {
    if (!selectedBook) return;
    router.push(
      `/verses?book=${encodeURIComponent(selectedBook.name)}&chapter=${chapter}`
    );
  };

  let title = 'KJV Bible';
  let subtitle: string | undefined;
  if (stage === 'books' && testament) {
    title = testament === 'OT' ? 'Old Testament' : 'New Testament';
  } else if (stage === 'chapters' && selectedBook) {
    title = selectedBook.name;
    subtitle = `${testament === 'OT' ? 'Old Testament' : 'New Testament'}`;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title={title}
        subtitle={subtitle}
        showBack={stage !== 'testament'}
        showFontControls={stage === 'chapters'}
        right={<LanguageToggle />}
      />

      {stage === 'testament' && (
        <View style={styles.centerWrap}>
          <Text style={[styles.heading, { color: theme.text }]}>
            Choose a Testament
          </Text>
          <TouchableOpacity
            style={[styles.bigBtn, { backgroundColor: theme.primary }]}
            onPress={() => onPickTestament('OT')}
          >
            <Text style={[styles.bigBtnText, { color: theme.primaryText }]}>
              Old Testament
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bigBtn, { backgroundColor: theme.primary }]}
            onPress={() => onPickTestament('NT')}
          >
            <Text style={[styles.bigBtnText, { color: theme.primaryText }]}>
              New Testament
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {stage === 'books' && testament && (
        <ScrollView contentContainerStyle={styles.listWrap}>
          {getBooks(testament).map((book) => {
            const hasText = book.chapters.some((ch) =>
              ch.verses.some((v) => v.text && v.text.length > 0)
            );
            return (
              <TouchableOpacity
                key={book.name}
                style={[
                  styles.listItem,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
                onPress={() => onPickBook(book)}
              >
                <View style={styles.listItemLeft}>
                  <Text style={[styles.listItemText, { color: theme.text }]}>
                    {book.name}
                  </Text>
                  {!hasText && (
                    <Text style={[styles.listItemBadge, { color: theme.textMuted }]}>
                      not loaded
                    </Text>
                  )}
                </View>
                <Text style={[styles.listItemMeta, { color: theme.textMuted }]}>
                  {book.chapters.length} chapter{book.chapters.length > 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {stage === 'chapters' && selectedBook && (
        <ScrollView contentContainerStyle={styles.gridWrap}>
          {selectedBook.chapters.map((ch) => {
            const hasText =
              ch.verses.length > 0 &&
              ch.verses.some((v) => v.text && v.text.length > 0);
            return (
              <TouchableOpacity
                key={ch.number}
                style={[
                  styles.gridItem,
                  {
                    backgroundColor: hasText ? theme.card : theme.surfaceAlt,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => onPickChapter(ch.number)}
              >
                <Text
                  style={[
                    styles.gridItemText,
                    { color: hasText ? theme.text : theme.textMuted },
                  ]}
                >
                  {ch.number}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 18,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  bigBtn: {
    width: '100%',
    maxWidth: 360,
    paddingVertical: 22,
    borderRadius: 14,
    alignItems: 'center',
  },
  bigBtnText: {
    fontSize: 20,
    fontWeight: '700',
  },
  listWrap: {
    padding: 12,
    gap: 8,
  },
  listItem: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemText: {
    fontSize: 18,
    fontWeight: '600',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  listItemBadge: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  listItemMeta: {
    fontSize: 13,
  },
  gridWrap: {
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridItem: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridItemText: {
    fontSize: 20,
    fontWeight: '700',
  },
});
