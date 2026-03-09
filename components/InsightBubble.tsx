import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { AIBrainSummary } from '@/types/insights';

interface Props {
  summary: AIBrainSummary | null;
}

export default function InsightBubble({ summary }: Props) {
  if (!summary || summary.messages.length === 0) return null;

  return (
    <Animated.View entering={FadeInUp.duration(600).delay(300)} style={styles.container}>
      {/* Bot Avatar */}
      <View style={styles.avatarContainer}>
        <Ionicons name="sparkles" size={20} color="#2C2B29" />
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

const styles = StyleSheet.create({
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
    backgroundColor: '#D3A77A', // Premium Gold
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#D3A77A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    marginTop: 8,
  },
  bubble: {
    flex: 1,
    backgroundColor: '#383633',
    borderRadius: 20,
    padding: 16,
    borderTopLeftRadius: 4, // Make it look like a chat bubble pointing left
    borderWidth: 1,
    borderColor: '#4E4B47',
  },
  bubbleArrow: {
    position: 'absolute',
    top: 15,
    left: -7,
    width: 14,
    height: 14,
    backgroundColor: '#383633',
    transform: [{ rotate: '45deg' }],
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#4E4B47',
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D3A77A',
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
    backgroundColor: '#A7A4A0',
    marginTop: 8,
    marginRight: 8,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    color: '#F2EFEB',
    lineHeight: 20,
  },
});
