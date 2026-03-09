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

const { width: screenWidth } = Dimensions.get('window');

interface Props {
    buildings: CityBuildingData[];
    containerHeight: number;
    onBuildingPress: (building: CityBuildingData) => void;
}

const CitySkyline: React.FC<Props> = ({ buildings, containerHeight, onBuildingPress }) => {
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
        <View style={[styles.container, { height: containerHeight }]}>
            {/* Background Elements */}
            <Animated.View style={[styles.parallaxContainer, parallaxBgStyle]}>
                {/* Moon */}
                <View style={styles.moon} />
                {/* Distant Stars */}
                {[...Array(15)].map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.star,
                            {
                                top: Math.random() * 100,
                                left: Math.random() * screenWidth * 3,
                                opacity: Math.random() * 0.8 + 0.2
                            }
                        ]}
                    />
                ))}
                {/* Distant skyline silhouette */}
                <View style={styles.silhouetteContainer}>
                    <View style={[styles.silhouette, { height: 40, width: 60, left: 100 }]} />
                    <View style={[styles.silhouette, { height: 60, width: 80, left: 240 }]} />
                    <View style={[styles.silhouette, { height: 30, width: 40, left: 450 }]} />
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
            <View style={styles.ground} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#2C2B29', // Match dashboard bg
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#4E4B47',
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
        backgroundColor: '#F2EFEB',
        opacity: 0.1,
        shadowColor: '#F2EFEB',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
    },
    star: {
        position: 'absolute',
        width: 2,
        height: 2,
        backgroundColor: 'white',
        borderRadius: 1,
    },
    silhouetteContainer: {
        position: 'absolute',
        bottom: 60,
        flexDirection: 'row',
    },
    silhouette: {
        backgroundColor: 'rgba(78, 75, 71, 0.2)',
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
        backgroundColor: '#4E4B47',
        opacity: 0.5,
    },
});

export default CitySkyline;
