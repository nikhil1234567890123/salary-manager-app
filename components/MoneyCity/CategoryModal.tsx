import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CityBuildingData } from '@/types/money-city';
import { formatCurrency } from '@/utils/formatters';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

interface Props {
    visible: boolean;
    building: CityBuildingData | null;
    onClose: () => void;
    totalSalary: number;
}

const { width: screenWidth } = Dimensions.get('window');

const CategoryModal: React.FC<Props> = ({ visible, building, onClose, totalSalary }) => {
    if (!building) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />

                <Animated.View
                    entering={FadeInDown.springify()}
                    exiting={FadeOutDown}
                    style={styles.container}
                >
                    <View style={styles.header}>
                        <View style={[styles.iconContainer, { backgroundColor: building.color }]}>
                            <Ionicons name={building.icon} size={24} color="white" />
                        </View>
                        <View style={styles.headerText}>
                            <Text style={styles.title}>{building.category}</Text>
                            <Text style={styles.subtitle}>Spending Details</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#A7A4A0" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.statRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Total Spent</Text>
                                <Text style={[styles.statValue, { color: building.color }]}>
                                    ₹{formatCurrency(building.amount)}
                                </Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>Of Salary</Text>
                                <Text style={styles.statValue}>{building.percentage.toFixed(1)}%</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Ionicons name="receipt-outline" size={18} color="#A7A4A0" />
                            <Text style={styles.infoText}>
                                {building.transactionCount} transactions recorded this month.
                            </Text>
                        </View>

                        <View style={styles.progressContainer}>
                            <View style={styles.progressHeader}>
                                <Text style={styles.progressLabel}>Budget Utilization</Text>
                                <Text style={styles.progressValue}>{building.percentage.toFixed(1)}%</Text>
                            </View>
                            <View style={styles.progressBarBg}>
                                <View
                                    style={[
                                        styles.progressBarFill,
                                        {
                                            width: `${Math.min(100, building.percentage)}%`,
                                            backgroundColor: building.color
                                        }
                                    ]}
                                />
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={onClose}
                    >
                        <Text style={styles.actionButtonText}>GOT IT</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    container: {
        backgroundColor: '#383633',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        width: '100%',
        borderColor: '#4E4B47',
        borderWidth: 1,
        borderBottomWidth: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        flex: 1,
        marginLeft: 16,
    },
    title: {
        color: '#F2EFEB',
        fontSize: 20,
        fontFamily: 'system-ui',
        fontWeight: '800',
    },
    subtitle: {
        color: '#A7A4A0',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 2,
    },
    closeButton: {
        padding: 4,
    },
    content: {
        marginBottom: 32,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statItem: {
        flex: 1,
    },
    statLabel: {
        color: '#A7A4A0',
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    statValue: {
        color: '#F2EFEB',
        fontSize: 24,
        fontWeight: '900',
    },
    divider: {
        height: 1,
        backgroundColor: '#4E4B47',
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: '#2C2B29',
        padding: 12,
        borderRadius: 12,
    },
    infoText: {
        color: '#A7A4A0',
        fontSize: 13,
        marginLeft: 10,
        fontWeight: '500',
    },
    progressContainer: {
        marginTop: 8,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    progressLabel: {
        color: '#A7A4A0',
        fontSize: 12,
        fontWeight: 'bold',
    },
    progressValue: {
        color: '#F2EFEB',
        fontSize: 12,
        fontWeight: 'bold',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#2C2B29',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    actionButton: {
        backgroundColor: '#4E4B47',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 10,
    },
    actionButtonText: {
        color: '#F2EFEB',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 2,
    },
});

export default CategoryModal;
