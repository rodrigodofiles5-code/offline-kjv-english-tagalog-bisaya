import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Header } from '@/components/Header';
import { LanguageToggle } from '@/components/LanguageToggle';
import { VerseCard } from '@/components/VerseCard';
import { useTheme } from '@/contexts/theme';
import { getBook, findVerseText, TRANSLATION_LABELS } from '@/data/bibleData';
import { TranslationCode } from '@/types/bible';

export default function VersesScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ book: string; chapter: string; verse?: string }>();
  const bookName = decodeURIComponent(params.book ?? '');
  const chapter = parseInt(params.chapter ?? '1', 10);
  const targetVerse = params.verse ? parseInt(params.verse, 10) : null;
  const listRef = useRef<FlatList>(null);

  const enBook = getBook(bookName, 'en');
  const chapterData = enBook?.chapters.find((c) => c.number === chapter);

  useEffect(() => {
    if (targetVerse && listRef.current && chapterData) {
      const idx = chapterData.verses.findIndex((v) => v.number === targetVerse);
      if (idx >= 0) {
        const t = setTimeout(() => {
          listRef.current?.scrollToIndex({
            index: idx,
            animated: true,
            viewPosition: 0.3,
          });
        }, 250);
        return () => clearTimeout(t);
      }
    }
  }, [targetVerse, chapterData]);

  const codes: TranslationCode[] = ['en', 'tl', 'ceb'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title={bookName}
        subtitle={`Chapter ${chapter}`}
        showBack
        showFontControls
        right={<LanguageToggle />}
      />

      <View style={styles.translationsBar}>
        {codes.map((code) => (
          <Text key={code} style={[styles.trLabel, { color: theme.textMuted }]}>
            {TRANSLATION_LABELS[code]}
          </Text>
        ))}
      </View>

      <FlatList
        ref={listRef}
        data={chapterData?.verses ?? []}
        keyExtractor={(item) => `${item.number}`}
        contentContainerStyle={{ paddingVertical: 10, paddingBottom: 40 }}
        onScrollToIndexFailed={(info) => {
          const t = setTimeout(() => {
            listRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true });
          }, 100);
          return () => clearTimeout(t);
        }}
        renderItem={({ item }) => (
          <VerseCard
            book={bookName}
            chapter={chapter}
            verse={{
              number: item.number,
              text: findVerseText(bookName, chapter, item.number, 'en'),
              tl: findVerseText(bookName, chapter, item.number, 'tl') || undefined,
              ceb: findVerseText(bookName, chapter, item.number, 'ceb') || undefined,
            }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              No verses found for {bookName} {chapter}.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  translationsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  trLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
