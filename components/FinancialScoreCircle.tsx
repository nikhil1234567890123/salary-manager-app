import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    Easing,
    interpolateColor
} from 'react-native-reanimated';
import { useAppTheme } from '@/hooks/useAppTheme';

// Create animated component for SVG Circle
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
    score: number; // 0 to 100
    label: string;
    color: string;
    size?: number;
    strokeWidth?: number;
}

export default function FinancialScoreCircle({
    score,
    label,
    color,
    size = 200,
    strokeWidth = 15,
}: Props) {
    const theme = useAppTheme();
    const animatedScore = useSharedValue(0);

    useEffect(() => {
        animatedScore.value = withTiming(score, {
            duration: 1500,
            easing: Easing.out(Easing.cubic),
        });
    }, [score]);

    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset = circumference - (circumference * animatedScore.value) / 100;

        // Optional: interpolate color based on score directly if color prop is not preferred
        const currentColor = interpolateColor(
            animatedScore.value,
            [0, 50, 100],
            [theme.colors.danger, theme.colors.warning, theme.colors.success]
        );

        return {
            strokeDashoffset,
            stroke: color || currentColor,
        };
    });

    return (
        <View style={[{ width: size, height: size }, styles.container]}>
            <Svg width={size} height={size}>
                <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                    {/* Background Track */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={theme.colors.border}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    {/* Animated Foreground */}
                    <AnimatedCircle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        animatedProps={animatedProps}
                        strokeLinecap="round"
                    />
                </G>
            </Svg>

            {/* Inner Label & Score */}
            <View style={[StyleSheet.absoluteFillObject, styles.centerText]}>
                <Text style={[styles.scoreText, { color: theme.colors.text }]}>{score}</Text>
                <Text style={[styles.labelText, { color: theme.colors.textSecondary }]}>{label}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerText: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scoreText: {
        fontSize: 48,
        fontWeight: '900',
        textAlign: 'center',
    },
    labelText: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginTop: 4,
    },
});
