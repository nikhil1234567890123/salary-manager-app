import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMoneyCity } from '@/hooks/useMoneyCity';
import CitySkyline from './CitySkyline';
import CategoryModal from './CategoryModal';
import { CityBuildingData } from '@/types/money-city';
import { formatCurrency } from '@/utils/formatters';
import { useAppTheme } from '@/hooks/useAppTheme';

interface Props {
    size: number;
}

const MoneyCity: React.FC<Props> = ({ size }) => {
    const theme = useAppTheme();
    const { buildings, totalSalary, totalSpent, hasData } = useMoneyCity(120);
    const [selectedBuilding, setSelectedBuilding] = useState<CityBuildingData | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const handleBuildingPress = (building: CityBuildingData) => {
        setSelectedBuilding(building);
        setModalVisible(true);
    };

    if (!hasData && totalSalary === 0) {
        return (
            <View style={[styles.emptyContainer, { width: size, height: size, backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Ionicons name="business-outline" size={48} color={theme.colors.icon} />
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    Your city is waiting for its first resident! Add expenses to build your skyline.
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* City Header / Energy Source */}
            <View style={styles.header}>
                <View style={styles.energyLabelContainer}>
                    <Text style={[styles.energyLabel, { color: theme.colors.textSecondary }]}>City Energy (Budget)</Text>
                    <View style={[styles.energyBadge, { backgroundColor: `${theme.colors.primary}1A`, borderColor: `${theme.colors.primary}4D` }]}>
                        <View style={[styles.pulseDot, { backgroundColor: theme.colors.primary }]} />
                        <Text style={[styles.energyValue, { color: theme.colors.primary }]}>₹{formatCurrency(totalSalary)}</Text>
                    </View>
                </View>

                <View style={styles.spendInfo}>
                    <Text style={[styles.spendLabel, { color: theme.colors.textSecondary }]}>Total Built Cost</Text>
                    <Text style={[styles.spendValue, { color: theme.colors.text }]}>₹{formatCurrency(totalSpent)}</Text>
                </View>
            </View>

            {/* The City Skyline */}
            <CitySkyline
                buildings={buildings}
                containerHeight={250}
                onBuildingPress={handleBuildingPress}
            />

            {/* Instructions */}
            <View style={styles.footer}>
                <Ionicons name="information-circle-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>Tap a building to see spending efficiency</Text>
            </View>

            {/* Detail Modal */}
            <CategoryModal
                visible={modalVisible}
                building={selectedBuilding}
                onClose={() => setModalVisible(false)}
                totalSalary={totalSalary}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    energyLabelContainer: {
        flex: 1,
    },
    energyLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 6,
    },
    energyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        alignSelf: 'flex-start',
    },
    pulseDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 8,
    },
    energyValue: {
        fontSize: 16,
        fontWeight: '900',
    },
    spendInfo: {
        alignItems: 'flex-end',
    },
    spendLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    spendValue: {
        fontSize: 16,
        fontWeight: '800',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
    },
    footerText: {
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 6,
    },
    emptyContainer: {
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        padding: 40,
    },
    emptyText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 20,
    }
});

export default MoneyCity;
