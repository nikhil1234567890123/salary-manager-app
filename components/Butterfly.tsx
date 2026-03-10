import React, { useEffect, useCallback } from 'react';
import { View, useWindowDimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Path, G, Defs, RadialGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import Animated, {
    useAnimatedStyle,
    useAnimatedProps,
    useSharedValue,
    cancelAnimation,
    runOnJS,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
    interpolate,
    Extrapolation
} from 'react-native-reanimated';
import { useAppTheme } from '@/hooks/useAppTheme';

const AnimatedG = Animated.createAnimatedComponent(G);

export const Butterfly = () => {
    const theme = useAppTheme();

    const { width, height } = useWindowDimensions();

    // Positional and Flight animations
    const posX = useSharedValue(width * 0.3);
    const posY = useSharedValue(height * 0.4);
    const rotation = useSharedValue(45);
    const scale = useSharedValue(0.1);

    // Wing flap animation (0 to 1)
    const flap = useSharedValue(0);
    const isDragging = useSharedValue(false);

    // Initial offsets for dragging
    const startX = useSharedValue(0);
    const startY = useSharedValue(0);

    // Haptic helpers for thread-safe calls
    const triggerHaptics = (type: 'impact' | 'success') => {
        if (type === 'impact') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    };

    // Unified flight logic - JS Thread for maximum stability
    const flyAround = useCallback(() => {
        if (isDragging.value) return;

        // Increased padding (80px) to prevent edge glitches
        const nextX = Math.random() * (width - 150) + 25;
        const nextY = Math.random() * (height - 150) + 25;
        const duration = 3000 + Math.random() * 3000;

        // Calculate rotation 
        const dx = nextX - posX.value;
        const dy = nextY - posY.value;
        const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

        // Cancel previous animations to prevent "animation storms"
        cancelAnimation(rotation);
        cancelAnimation(posX);
        cancelAnimation(posY);

        rotation.value = withTiming(targetAngle, { duration: 800 });
        posX.value = withTiming(nextX, { duration, easing: Easing.inOut(Easing.sin) });
        posY.value = withTiming(nextY, { duration, easing: Easing.inOut(Easing.sin) }, (finished) => {
            if (finished && !isDragging.value) {
                runOnJS(flyAround)();
            }
        });
    }, [width, height]);

    useEffect(() => {
        // Reveal animation
        scale.value = withTiming(0.8, { duration: 1000, easing: Easing.out(Easing.back()) });

        // Rapid wing flapping
        flap.value = withRepeat(
            withTiming(1, { duration: 100, easing: Easing.inOut(Easing.sin) }),
            -1,
            true
        );

        flyAround();
    }, [flyAround]);

    // Gesture Handler with stable haptics and animation control
    const gesture = Gesture.Pan()
        .onStart(() => {
            isDragging.value = true;
            startX.value = posX.value;
            startY.value = posY.value;

            cancelAnimation(posX);
            cancelAnimation(posY);
            cancelAnimation(rotation);

            runOnJS(triggerHaptics)('impact');
        })
        .onUpdate((event) => {
            posX.value = startX.value + event.translationX;
            posY.value = startY.value + event.translationY;
        })
        .onEnd(() => {
            isDragging.value = false;
            runOnJS(triggerHaptics)('success');
            runOnJS(flyAround)();
        });

    // Wing animation props (2D simulation of 3D flapping)
    const leftWingProps = useAnimatedProps(() => ({
        transform: [
            { translateX: 50 },
            { scaleX: interpolate(flap.value, [0, 1], [1, 0.1], Extrapolation.CLAMP) },
            { translateX: -50 }
        ],
    }));

    const rightWingProps = useAnimatedProps(() => ({
        transform: [
            { translateX: 50 },
            { scaleX: interpolate(flap.value, [0, 1], [1, 0.1], Extrapolation.CLAMP) },
            { translateX: -50 }
        ],
    }));

    const containerStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: posX.value },
            { translateY: posY.value },
            { rotate: `${rotation.value}deg` },
            { scale: scale.value }
        ],
    }));

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View pointerEvents="auto" style={[styles.container, containerStyle]}>
                <Svg width="100" height="100" viewBox="0 0 100 100">
                    <Defs>
                        <RadialGradient id="wingGrad" cx="50%" cy="50%" rx="50%" ry="50%">
                            <Stop offset="0%" stopColor={theme.colors.primary} stopOpacity="0.9" />
                            <Stop offset="100%" stopColor={theme.colors.primary} stopOpacity="0.6" />
                        </RadialGradient>
                    </Defs>

                    {/* Left Wing Group */}
                    <AnimatedG animatedProps={leftWingProps}>
                        {/* Main Wing */}
                        <Path
                            d="M50 50 C20 30, 0 40, 5 70 C10 85, 45 80, 50 50"
                            fill="url(#wingGrad)"
                            stroke={theme.colors.primary}
                            strokeWidth="1"
                        />
                        {/* Secondary Layer */}
                        <Path
                            d="M50 50 C30 45, 15 50, 20 65 C25 75, 45 70, 50 50"
                            fill="rgba(255,255,255,0.3)"
                        />
                        {/* Top Wing Part */}
                        <Path
                            d="M50 50 C20 10, 5 20, 15 45 C25 60, 45 55, 50 50"
                            fill="url(#wingGrad)"
                            stroke={theme.colors.primary}
                            strokeWidth="1"
                        />
                    </AnimatedG>

                    {/* Right Wing Group */}
                    <AnimatedG animatedProps={rightWingProps}>
                        <Path
                            d="M50 50 C80 30, 100 40, 95 70 C90 85, 55 80, 50 50"
                            fill="url(#wingGrad)"
                            stroke={theme.colors.primary}
                            strokeWidth="1"
                        />
                        <Path
                            d="M50 50 C70 45, 85 50, 80 65 C75 75, 55 70, 50 50"
                            fill="rgba(255,255,255,0.3)"
                        />
                        <Path
                            d="M50 50 C80 10, 95 20, 85 45 C75 60, 55 55, 50 50"
                            fill="url(#wingGrad)"
                            stroke={theme.colors.primary}
                            strokeWidth="1"
                        />
                    </AnimatedG>

                    {/* Antennae */}
                    <Path d="M48 45 L45 35" stroke="#333" strokeWidth="1" />
                    <Path d="M52 45 L55 35" stroke="#333" strokeWidth="1" />

                    {/* Core Body */}
                    <Path d="M50 45 Q52 50 50 75 Q48 50 50 45" fill="#333" />
                </Svg>
            </Animated.View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: 100,
        height: 100,
        zIndex: 9999,
    },
});
