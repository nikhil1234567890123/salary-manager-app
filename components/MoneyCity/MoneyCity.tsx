import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMoneyCity } from '@/hooks/useMoneyCity';
import CitySkyline from './CitySkyline';
import CategoryModal from './CategoryModal';
import { CityBuildingData } from '@/types/money-city';
import { formatCurrency } from '@/utils/formatters';

interface Props {
    size: number;
}

const MoneyCity: React.FC<Props> = ({ size }) => {
    const { buildings, totalSalary, totalSpent, hasData } = useMoneyCity(120);
    const [selectedBuilding, setSelectedBuilding] = useState<CityBuildingData | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const handleBuildingPress = (building: CityBuildingData) => {
        setSelectedBuilding(building);
        setModalVisible(true);
    };

    if (!hasData && totalSalary === 0) {
        return (
            <View style={[styles.emptyContainer, { width: size, height: size }]}>
                <Ionicons name="business-outline" size={48} color="#4E4B47" />
                <Text style={styles.emptyText}>
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
                    <Text style={styles.energyLabel}>City Energy (Budget)</Text>
                    <View style={styles.energyBadge}>
                        <View style={styles.pulseDot} />
                        <Text style={styles.energyValue}>₹{formatCurrency(totalSalary)}</Text>
                    </View>
                </View>

                <View style={styles.spendInfo}>
                    <Text style={styles.spendLabel}>Total Built Cost</Text>
                    <Text style={styles.spendValue}>₹{formatCurrency(totalSpent)}</Text>
                </View>
            </View>

            {/* The City Skyline */}
            <CitySkyline
                buildings={buildings}
                containerHeight={220}
                onBuildingPress={handleBuildingPress}
            />

            {/* Instructions */}
            <View style={styles.footer}>
                <Ionicons name="information-circle-outline" size={14} color="#65625E" />
                <Text style={styles.footerText}>Tap a building to see spending efficiency</Text>
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
        color: '#A7A4A0',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 6,
    },
    energyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(211, 167, 122, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(211, 167, 122, 0.3)',
        alignSelf: 'flex-start',
    },
    pulseDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#D3A77A',
        marginRight: 8,
    },
    energyValue: {
        color: '#D3A77A',
        fontSize: 16,
        fontWeight: '900',
    },
    spendInfo: {
        alignItems: 'flex-end',
    },
    spendLabel: {
        color: '#A7A4A0',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    spendValue: {
        color: '#F2EFEB',
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
        color: '#65625E',
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 6,
    },
    emptyContainer: {
        backgroundColor: '#383633',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#4E4B47',
        borderWidth: 1,
        padding: 40,
    },
    emptyText: {
        color: '#A7A4A0',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 20,
    }
});

export default MoneyCity;
