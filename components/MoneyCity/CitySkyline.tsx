import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedScrollHandler,
    interpolate
} from 'react-native-reanimated';
import CityBuilding from './CityBuilding';
import { CityBuildingData } from '@/types/money-city';
import { useAppTheme } from '@/hooks/useAppTheme';

const { width: screenWidth } = Dimensions.get('window');

interface Props {
    buildings: CityBuildingData[];
    containerHeight: number;
    onBuildingPress: (building: CityBuildingData) => void;
}

const CitySkyline: React.FC<Props> = ({ buildings, containerHeight, onBuildingPress }) => {
    const theme = useAppTheme();
    const scrollX = useSharedValue(0);

    const onScroll = useAnimatedScrollHandler((event) => {
        scrollX.value = event.contentOffset.x;
    });

    // Parallax background style
    const parallaxBgStyle = useAnimatedStyle(() => {
        const translateX = interpolate(
            scrollX.value,
            [0, screenWidth * 2],
            [0, -100]
        );
        return {
            transform: [{ translateX }],
        };
    });

    return (
        <View style={[styles.container, { height: containerHeight, backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            {/* Background Elements */}
            <Animated.View style={[styles.parallaxContainer, parallaxBgStyle]}>
                {/* Moon */}
                <View style={[styles.moon, { backgroundColor: theme.colors.text, shadowColor: theme.colors.text }]} />
                {/* Distant Stars */}
                {[...Array(15)].map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.star,
                            {
                                top: Math.random() * 100,
                                left: Math.random() * screenWidth * 3,
                                opacity: Math.random() * 0.8 + 0.2,
                                backgroundColor: theme.colors.textSecondary
                            }
                        ]}
                    />
                ))}
                {/* Distant skyline silhouette */}
                <View style={styles.silhouetteContainer}>
                    <View style={[styles.silhouette, { height: 40, width: 60, left: 100, backgroundColor: theme.colors.border }]} />
                    <View style={[styles.silhouette, { height: 60, width: 80, left: 240, backgroundColor: theme.colors.border }]} />
                    <View style={[styles.silhouette, { height: 30, width: 40, left: 450, backgroundColor: theme.colors.border }]} />
                </View>
            </Animated.View>

            <Animated.ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
                contentContainerStyle={styles.scrollContent}
            >
                {buildings.map((building, index) => (
                    <CityBuilding
                        key={building.id}
                        data={building}
                        index={index}
                        onPress={onBuildingPress}
                    />
                ))}
            </Animated.ScrollView>

            {/* Ground/Street */}
            <View style={[styles.ground, { backgroundColor: theme.colors.border }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
    },
    parallaxContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: screenWidth * 4,
    },
    moon: {
        position: 'absolute',
        top: 30,
        right: 50,
        width: 40,
        height: 40,
        borderRadius: 20,
        opacity: 0.1,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
    },
    star: {
        position: 'absolute',
        width: 2,
        height: 2,
        borderRadius: 1,
    },
    silhouetteContainer: {
        position: 'absolute',
        bottom: 60,
        flexDirection: 'row',
    },
    silhouette: {
        borderRadius: 4,
    },
    scrollContent: {
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        paddingBottom: 70, // Space for labels
        minWidth: screenWidth,
    },
    ground: {
        position: 'absolute',
        bottom: 55,
        left: 0,
        right: 0,
        height: 4,
        opacity: 0.5,
    },
});

export default CitySkyline;
