import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TimelineEvent } from '@/types/insights';
import { formatCurrency } from '@/utils/formatters';

interface Props {
    events: TimelineEvent[];
}

export default function MoneyTimeline({ events }: Props) {
    if (!events || events.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="time-outline" size={48} color="#4E4B47" />
                <Text style={styles.emptyText}>No events yet this month.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {events.map((event, index) => {
                const isLast = index === events.length - 1;

                return (
                    <View key={event.id} style={styles.eventRow}>
                        {/* Timeline Graphic column */}
                        <View style={styles.timelineColumn}>
                            <View style={[styles.iconContainer, { backgroundColor: event.color + '20', borderColor: event.color }]}>
                                <Ionicons name={event.icon as any} size={16} color={event.color} />
                            </View>
                            {/* Connecting Line (unless it's the last item) */}
                            {!isLast && <View style={styles.connectorLine} />}
                        </View>

                        {/* Content Column */}
                        <View style={[styles.contentColumn, !isLast && styles.contentColumnMargin]}>
                            <Text style={styles.dateText}>
                                {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </Text>
                            <Text style={styles.titleText}>{event.title}</Text>
                            <Text style={styles.descriptionText}>{event.description}</Text>
                        </View>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 30,
        backgroundColor: '#383633',
        borderRadius: 24,
    },
    emptyText: {
        color: '#A7A4A0',
        marginTop: 10,
        fontSize: 14,
    },
    eventRow: {
        flexDirection: 'row',
    },
    timelineColumn: {
        alignItems: 'center',
        width: 40,
        marginRight: 10,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2, // Above the line
    },
    connectorLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#4E4B47',
        marginTop: -4,
        marginBottom: -4,
        zIndex: 1,
    },
    contentColumn: {
        flex: 1,
        paddingTop: 4,
    },
    contentColumnMargin: {
        marginBottom: 24,
    },
    dateText: {
        fontSize: 11,
        fontFamily: 'System',
        color: '#A7A4A0',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    titleText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#F2EFEB',
        marginBottom: 4,
    },
    descriptionText: {
        fontSize: 13,
        color: '#A7A4A0',
        lineHeight: 18,
    },
});
