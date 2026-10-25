import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { Bookmark, Highlighter, Copy, Trash2, Share2 } from 'lucide-react-native';
import ViewShot, { ViewShotRef } from 'react-native-view-shot';
import { Header } from '@/components/Header';
import { useTheme } from '@/contexts/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { Bookmark as BookmarkType } from '@/types/bible';

export default function BookmarksScreen() {
  const theme = useTheme();
  const { settings } = useSettings();
  const { bookmarks, toggleHighlight, removeBookmark } = useBookmarks();
  const shotRefs = useRef<Record<string, ViewShotRef | null>>({});

  const onCopy = useCallback(async (bm: BookmarkType) => {
    const text = `${bm.book} ${bm.chapter}:${bm.verse}\n[EN-KJV] ${bm.text.en}\n[TL-KJV] ${bm.text.tl}\n[CEB-KJV] ${bm.text.ceb}`;
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'Verse copied to clipboard.');
  }, []);

  const onShareImage = useCallback(async (bm: BookmarkType) => {
    const ref = shotRefs.current[bm.id];
    if (!ref) return;
    try {
      const uri = await ref.capture();
      if (uri && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share verse',
        });
      }
    } catch {
      // ignore
    }
  }, []);

  const fontSize = Math.round(16 * settings.fontScale);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Saved Verses" subtitle={`${bookmarks.length} bookmark${bookmarks.length === 1 ? '' : 's'}`} />

      <FlatList
        data={bookmarks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Bookmark size={42} color={theme.textMuted} />
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              No saved verses yet. Long-press any verse to bookmark it.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              {
                backgroundColor: item.highlighted ? theme.highlight : theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <ViewShot
              ref={(r) => {
                shotRefs.current[item.id] = r;
              }}
              options={{ format: 'png', quality: 1 }}
            >
              <TouchableOpacity
                onPress={() =>
                  router.push(
                    `/verses?book=${encodeURIComponent(item.book)}&chapter=${item.chapter}&verse=${item.verse}`
                  )
                }
              >
                <Text style={[styles.ref, { color: theme.primary }]}>
                  {item.book} {item.chapter}:{item.verse}
                </Text>

                {settings.showEn && (
                  <VerseRow label="EN" color="#1e4d8b" text={item.text.en} fontSize={fontSize} textColor={theme.text} />
                )}
                {settings.showTl && item.text.tl && (
                  <VerseRow label="TL" color="#2e7d4f" text={item.text.tl} fontSize={fontSize} textColor={theme.text} />
                )}
                {settings.showCeb && item.text.ceb && (
                  <VerseRow label="CEB" color="#b07d2e" text={item.text.ceb} fontSize={fontSize} textColor={theme.text} />
                )}
              </TouchableOpacity>
            </ViewShot>

            <View style={[styles.actions, { borderTopColor: theme.border }]}>
              <ActionBtn
                icon={<Highlighter size={18} color={theme.text} />}
                label={item.highlighted ? 'Unhighlight' : 'Highlight'}
                onPress={() => toggleHighlight(item.id)}
                theme={theme}
              />
              <ActionBtn
                icon={<Copy size={18} color={theme.text} />}
                label="Copy"
                onPress={() => onCopy(item)}
                theme={theme}
              />
              <ActionBtn
                icon={<Share2 size={18} color={theme.text} />}
                label="Image"
                onPress={() => onShareImage(item)}
                theme={theme}
              />
              <ActionBtn
                icon={<Trash2 size={18} color="#c62828" />}
                label="Remove"
                onPress={() => removeBookmark(item.id)}
                theme={theme}
              />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function VerseRow({
  label,
  color,
  text,
  fontSize,
  textColor,
}: {
  label: string;
  color: string;
  text: string;
  fontSize: number;
  textColor: string;
}) {
  return (
    <View style={styles.row}>
      <View style={[styles.tag, { backgroundColor: color }]}>
        <Text style={styles.tagText}>{label}</Text>
      </View>
      <Text style={{ fontSize, color: textColor, lineHeight: fontSize * 1.5, flex: 1 }}>
        {text}
      </Text>
    </View>
  );
}

function ActionBtn({
  icon,
  label,
  onPress,
  theme,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      {icon}
      <Text style={[styles.actionLabel, { color: theme.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  ref: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  tagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionLabel: {
    fontSize: 13,
  },
});
