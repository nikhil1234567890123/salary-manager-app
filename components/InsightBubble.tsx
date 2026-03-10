import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { AIBrainSummary } from '@/types/insights';
import { useAppTheme } from '@/hooks/useAppTheme';

interface Props {
  summary: AIBrainSummary | null;
}

export default function InsightBubble({ summary }: Props) {
  const theme = useAppTheme();

  if (!summary || summary.messages.length === 0) return null;

  const styles = createStyles(theme);

  return (
    <Animated.View entering={FadeInUp.duration(600).delay(300)} style={styles.container}>
      {/* Bot Avatar */}
      <View style={styles.avatarContainer}>
        <Ionicons name="sparkles" size={20} color={theme.colors.background} />
      </View>

      {/* Bubble Chat */}
      <View style={styles.bubble}>
        <View style={styles.bubbleArrow} />
        <Text style={styles.headerTitle}>Financial Brain</Text>

        {summary.messages.map((msg, idx) => (
          <View key={idx} style={styles.bulletRow}>
            <View style={styles.bulletPoint} />
            <Text style={styles.messageText}>{msg}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    marginTop: 8,
  },
  bubble: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 16,
    borderTopLeftRadius: 4, // Make it look like a chat bubble pointing left
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bubbleArrow: {
    position: 'absolute',
    top: 15,
    left: -7,
    width: 14,
    height: 14,
    backgroundColor: theme.colors.surface,
    transform: [{ rotate: '45deg' }],
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bulletPoint: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.textSecondary,
    marginTop: 8,
    marginRight: 8,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
});
