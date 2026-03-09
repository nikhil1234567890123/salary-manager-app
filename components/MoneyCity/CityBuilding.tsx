import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    withSequence,
    Easing
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { CityBuildingData } from '@/types/money-city';
import { formatCurrency } from '@/utils/formatters';

interface Props {
    data: CityBuildingData;
    onPress: (data: CityBuildingData) => void;
    index: number;
}

const CityBuilding: React.FC<Props> = ({ data, onPress, index }) => {
    const heightAnim = useSharedValue(0);
    const glowAnim = useSharedValue(0.3);

    useEffect(() => {
        // Staggered entry animation
        heightAnim.value = withTiming(data.height, {
            duration: 1000 + index * 100,
            easing: Easing.out(Easing.exp),
        });

        // Subtle window glow animation
        glowAnim.value = withRepeat(
            withSequence(
                withTiming(0.7, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, [data.height]);

    const animatedStyle = useAnimatedStyle(() => ({
        height: heightAnim.value,
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowAnim.value,
    }));

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onPress(data)}
            style={styles.container}
        >
            <View style={styles.buildingWrapper}>
                <Animated.View
                    style={[
                        styles.building,
                        { backgroundColor: data.color },
                        animatedStyle
                    ]}
                >
                    {/* Windows / Glowing effect */}
                    <View style={styles.windowsContainer}>
                        {[1, 2, 3, 4].map((i) => (
                            <View key={i} style={styles.windowRow}>
                                {[1, 2].map((j) => (
                                    <Animated.View
                                        key={j}
                                        style={[styles.window, glowStyle]}
                                    />
                                ))}
                            </View>
                        ))}
                    </View>

                    {/* Icon Overlay */}
                    <View style={styles.iconContainer}>
                        <Ionicons name={data.icon} size={16} color="white" />
                    </View>
                </Animated.View>

                {/* Labels below building */}
                <View style={styles.labels}>
                    <Text style={styles.categoryText} numberOfLines={1}>
                        {data.category}
                    </Text>
                    <Text style={styles.amountText}>
                        ₹{formatCurrency(data.amount)}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    buildingWrapper: {
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    building: {
        width: 45,
        borderRadius: 8,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        position: 'relative',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
    },
    windowsContainer: {
        paddingTop: 10,
        alignItems: 'center',
    },
    windowRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    window: {
        width: 6,
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        marginHorizontal: 4,
        borderRadius: 1,
    },
    iconContainer: {
        position: 'absolute',
        bottom: 8,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 8,
        padding: 4,
    },
    labels: {
        marginTop: 10,
        alignItems: 'center',
        width: 60,
    },
    categoryText: {
        color: '#A7A4A0',
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    amountText: {
        color: '#F2EFEB',
        fontSize: 9,
        fontWeight: '600',
        marginTop: 2,
    },
});

export default CityBuilding;
