import { View, Text, StyleSheet, SafeAreaView, ScrollView, Linking } from 'react-native';
import { Book, Info, WifiOff, Bell, Type, Bookmark } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { useTheme } from '@/contexts/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { Switch } from 'react-native';

export default function AboutScreen() {
  const theme = useTheme();
  const { settings, update } = useSettings();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="About" />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
        <View style={[styles.heroCard, { backgroundColor: theme.primary }]}>
          <Book size={44} color={theme.primaryText} />
          <Text style={[styles.heroTitle, { color: theme.primaryText }]}>
            KJV Bible English Tagalog Bisaya Offline
          </Text>
          <Text style={[styles.heroSubtitle, { color: theme.primaryText }]}>
            All KJV only: KJV English, KJV Tagalog 1905, KJV Bisaya — Public Domain
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Translations included</Text>
          <Text style={[styles.sectionText, { color: theme.text }]}>
            • KJV English (King James Version){'\n'}
            • KJV Tagalog 1905{'\n'}
            • KJV Bisaya (Cebuano)
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Features</Text>
          <FeatureRow icon={<WifiOff size={20} color={theme.primary} />} text="100% offline — no internet permission" theme={theme} />
          <FeatureRow icon={<Book size={20} color={theme.primary} />} text="Old & New Testament navigation" theme={theme} />
          <FeatureRow icon={<Type size={20} color={theme.primary} />} text="Adjustable font size (18sp base)" theme={theme} />
          <FeatureRow icon={<Bookmark size={20} color={theme.primary} />} text="Bookmarks, highlight, copy, share as image" theme={theme} />
          <FeatureRow icon={<Bell size={20} color={theme.primary} />} text="Daily verse notification at 6:00 AM" theme={theme} />
        </View>

        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily verse notification</Text>
          <View style={styles.row}>
            <Text style={[styles.sectionText, { color: theme.text, flex: 1 }]}>
              Receive a random verse every day at 6:00 AM.
            </Text>
            <Switch
              value={settings.dailyNotificationEnabled}
              onValueChange={(v) => update({ dailyNotificationEnabled: v })}
              trackColor={{ false: '#ccc', true: theme.primary }}
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.row}>
            <Info size={20} color={theme.primary} />
            <Text style={[styles.sectionText, { color: theme.text, flex: 1 }]}>
              Public Domain — Offline — No Ads — No Login
            </Text>
          </View>
        </View>

        <Text style={[styles.footer, { color: theme.textMuted }]}>
          Complete Bible: all 66 books, 1,189 chapters, 31,102 verses — in KJV
          English, Tagalog 1905, and Cebuano. 100% offline, no internet required.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureRow({
  icon,
  text,
  theme,
}: {
  icon: React.ReactNode;
  text: string;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={styles.row}>
      {icon}
      <Text style={[styles.sectionText, { color: theme.text, flex: 1 }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroCard: {
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.9,
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  footer: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 12,
  },
});
