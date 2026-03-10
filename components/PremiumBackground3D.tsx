import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    interpolate,
    type SharedValue,
    Extrapolation
} from 'react-native-reanimated';
import { useAppTheme } from '@/hooks/useAppTheme';

const { width, height } = Dimensions.get('window');

interface KineticShapeProps {
    scrollY: SharedValue<number>;
    index: number;
}

const KineticShape = React.memo(({ scrollY, index }: KineticShapeProps) => {
    const theme = useAppTheme();

    // Predictable pseudo-random properties
    const size = 250 + (index * 130) % 450;
    const initialX = (index * 217.5) % (width * 1.5) - size;
    const initialY = (index * 383.1) % (height * 3);

    const scrollSpeed = 0.08 + (index * 0.18) % 2.2;
    const rotationOffset = index * 45;
    const rotationDirection = index % 2 === 0 ? 1 : -1;

    const animatedStyle = useAnimatedStyle(() => {
        const translateY = -scrollY.value * scrollSpeed;
        const currentY = initialY + translateY;

        // Rotation illusion
        const rotate = interpolate(
            scrollY.value,
            [0, 5000],
            [rotationOffset, rotationOffset + 2160 * rotationDirection],
            Extrapolation.CLAMP
        );

        // Depth Simulation (Scale based on Y position/scroll)
        const relativePos = currentY / height;
        const depthScale = interpolate(
            relativePos,
            [-1, 0, 1, 2],
            [0.5, 1.3, 0.5, 0.3],
            Extrapolation.CLAMP
        );

        // Fade according to visibility
        const opacity = interpolate(
            relativePos,
            [-0.5, 0.3, 1, 1.8],
            [0, 0.35, 0.25, 0], // Highly visible as requested
            Extrapolation.CLAMP
        );

        return {
            transform: [
                { translateX: initialX },
                { translateY: currentY },
                { perspective: 2000 },
                { rotateX: `${rotate * 0.4}deg` },
                { rotateY: `${rotate}deg` },
                { rotateZ: `${rotate * (0.15 + index * 0.05)}deg` },
                { scale: depthScale },
            ],
            opacity,
        };
    });

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    borderRadius: 80,
                    borderWidth: 3, // Thicker as requested
                    borderColor: theme.colors.primary + '55', // More visible
                    backgroundColor: theme.colors.primary + '0D', // Faint fill
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: theme.colors.primary,
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.1,
                    shadowRadius: 20,
                    elevation: 5,
                    width: size,
                    height: size,
                },
                animatedStyle
            ]}
        >
            {/* Core Detail */}
            <View
                style={{
                    width: '85%',
                    height: '85%',
                    borderColor: theme.colors.primary,
                    borderWidth: 2,
                    opacity: 0.6,
                    borderRadius: 40,
                    position: 'absolute',
                    transform: [{ rotate: '45deg' }]
                }}
            />
            {/* Abstract Inner Orbit */}
            <View
                style={{
                    width: '65%',
                    height: '65%',
                    borderColor: theme.colors.primary,
                    borderWidth: 1.5,
                    opacity: 0.4,
                    borderRadius: 100,
                    position: 'absolute',
                    transform: [{ rotateX: '60deg' }]
                }}
            />
            {/* Center Nucleus */}
            <View
                style={{
                    width: '18%',
                    height: '18%',
                    borderRadius: 100,
                    backgroundColor: theme.colors.primary,
                    opacity: 0.3,
                    elevation: 15
                }}
            />
        </Animated.View>
    );
});

export const PremiumBackground3D = ({ scrollY }: { scrollY: SharedValue<number> }) => {
    const theme = useAppTheme();

    return (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'transparent' }]} pointerEvents="none">
            {/* Background Deep Layer */}
            {[...Array(6)].map((_, i) => (
                <KineticShape key={`back-${i}`} index={i} scrollY={scrollY} />
            ))}

            {/* Mid Depth Layer */}
            {[...Array(6)].map((_, i) => (
                <KineticShape key={`mid-${i}`} index={i + 10} scrollY={scrollY} />
            ))}

            {/* Foreground Accent Layer (Ultra-visible) */}
            {[...Array(4)].map((_, i) => (
                <KineticShape key={`near-${i}`} index={i + 20} scrollY={scrollY} />
            ))}
        </View>
    );
};
