import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText, Path } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withSpring,
} from 'react-native-reanimated';
import { RadarMetrics } from '@/types/insights';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface Props {
    metrics: RadarMetrics;
    size?: number;
    onMetricPress?: (metricName: string, value: number) => void;
}

const RADIAN = Math.PI / 180;
// 5 axes, each 72 degrees apart.
const ANGLE_STEP = 360 / 5;

// The names/labels for the axes
const AXES = [
    { key: 'stability', label: 'Stability' },
    { key: 'control', label: 'Control' },
    { key: 'savings', label: 'Savings' },
    { key: 'moodScore', label: 'Mood' },
    { key: 'risk', label: 'Safety' }, // risk is inverted, higher = safer
];

export default function RadarChart({ metrics, size = 300, onMetricPress }: Props) {
    const center = size / 2;
    const radius = (size / 2) - 40; // leaving space for labels

    // Shared values for the 5 points to animate them smoothly
    const p0 = useSharedValue(0);
    const p1 = useSharedValue(0);
    const p2 = useSharedValue(0);
    const p3 = useSharedValue(0);
    const p4 = useSharedValue(0);

    useEffect(() => {
        // Values are 0-100, we convert them to a percentage of the radius
        p0.value = withSpring((metrics.stability / 100) * radius, { damping: 15 });
        p1.value = withSpring((metrics.control / 100) * radius, { damping: 15 });
        p2.value = withSpring((metrics.savings / 100) * radius, { damping: 15 });
        p3.value = withSpring((metrics.moodScore / 100) * radius, { damping: 15 });
        p4.value = withSpring((metrics.risk / 100) * radius, { damping: 15 });
    }, [metrics, radius]);

    // Create point from angle and distance
    const getPoint = (distance: number, angleIndex: number) => {
        'worklet';
        // Start at top (-90 degrees) and go clockwise
        const angle = (angleIndex * ANGLE_STEP - 90) * RADIAN;
        return {
            x: center + Math.cos(angle) * distance,
            y: center + Math.sin(angle) * distance,
        };
    };

    const animatedProps = useAnimatedProps(() => {
        const pt0 = getPoint(p0.value, 0);
        const pt1 = getPoint(p1.value, 1);
        const pt2 = getPoint(p2.value, 2);
        const pt3 = getPoint(p3.value, 3);
        const pt4 = getPoint(p4.value, 4);

        const d = `M ${pt0.x},${pt0.y} L ${pt1.x},${pt1.y} L ${pt2.x},${pt2.y} L ${pt3.x},${pt3.y} L ${pt4.x},${pt4.y} Z`;

        return { d };
    });

    // Background grid shapes (concentric polygons)
    const drawBgGrid = (levels = 4) => {
        const grids = [];
        for (let i = 1; i <= levels; i++) {
            const levelRadius = (radius / levels) * i;
            const points = AXES.map((_, index) => {
                const pt = getPoint(levelRadius, index);
                return `${pt.x},${pt.y}`;
            }).join(' ');
            grids.push(
                <Polygon
                    key={`bg-grid-${i}`}
                    points={points}
                    stroke="#4E4B47"
                    strokeWidth={1}
                    fill="transparent"
                />
            );
        }
        return grids;
    };

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size}>
                {/* Grids */}
                {drawBgGrid()}

                {/* Spoke lines from center to outer ring */}
                {AXES.map((_, index) => {
                    const pt = getPoint(radius, index);
                    return (
                        <Line
                            key={`spoke-${index}`}
                            x1={center}
                            y1={center}
                            x2={pt.x}
                            y2={pt.y}
                            stroke="#4E4B47"
                            strokeWidth={1}
                        />
                    );
                })}

                {/* Animated Fill Polygon (now Path for strict Android support) */}
                <AnimatedPath
                    animatedProps={animatedProps}
                    fill="#D3A77A"
                    fillOpacity={0.4}
                    stroke="#D3A77A"
                    strokeWidth={2}
                    strokeLinejoin="round"
                />

                {/* Outer Value circles/dots to tap on */}
                {AXES.map((axis, index) => {
                    const metricVal = metrics[(axis.key as keyof RadarMetrics)] || 0;
                    const pt = getPoint((metricVal / 100) * radius, index);
                    return (
                        <Circle
                            key={`dot-${index}`}
                            cx={pt.x}
                            cy={pt.y}
                            r={5}
                            fill="#D3A77A"
                            onPress={() => onMetricPress?.(axis.label, metricVal)}
                        />
                    );
                })}
            </Svg>

            {/* DOM-based Text Labels to allow easy styling/font mapping outside SVG (better native text rendering) */}
            {AXES.map((axis, index) => {
                const pt = getPoint(radius + 20, index); // Labels sit outside the max radius
                return (
                    <TouchableOpacity
                        key={`label-${index}`}
                        style={{
                            position: 'absolute',
                            left: pt.x - 40, // rough center given width
                            top: pt.y - 10,
                            width: 80,
                            alignItems: 'center',
                        }}
                        onPress={() => {
                            const metricVal = metrics[(axis.key as keyof RadarMetrics)] || 0;
                            onMetricPress?.(axis.label, metricVal);
                        }}
                    >
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#A7A4A0', textAlign: 'center' }}>
                            {axis.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
