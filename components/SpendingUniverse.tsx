import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withRepeat,
    withTiming,
    Easing,
    SharedValue,
    withSequence
} from 'react-native-reanimated';
import { PlanetCategory } from '@/types/insights';

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
    planets: PlanetCategory[];
    size?: number;
}

// Helper component to fix Hook rules loop violation
function Planet({ planet, center, masterTime }: { planet: PlanetCategory; center: number; masterTime: SharedValue<number> }) {
    const orbitProps = useAnimatedProps(() => {
        // Speed factor: slower planets have higher speed numbers in the model (e.g. 5000 means slow)
        // So we divide to get a multiplier.
        const angle = (masterTime.value * (10000 / planet.speed)) % 360;
        return {
            rotation: angle,
            originX: center,
            originY: center,
        } as any;
    });

    return (
        <G>
            {/* Orbit Path / Ring */}
            <Circle
                cx={center}
                cy={center}
                r={planet.orbitRadius}
                fill="none"
                stroke="#4E4B47"
                strokeWidth={1}
                strokeDasharray="4,4"
            />

            {/* The Planet Group (Animated) */}
            <AnimatedG animatedProps={orbitProps}>
                {/* We offset the planet by -orbitRadius on X to place it on the ring, since origin is center */}
                <G x={planet.orbitRadius} y={0}>
                    <Circle
                        cx={0}
                        cy={0}
                        r={planet.radius}
                        fill={planet.color}
                    />
                    {/* Category initial label near the planet */}
                    <SvgText
                        x={0}
                        y={-(planet.radius + 6)} // Moved text to top edge so it doesn't push the bounds outward further
                        fill="#A7A4A0"
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                    >
                        {planet.category.substring(0, 8)}
                    </SvgText>
                </G>
            </AnimatedG>
        </G>
    );
}

export default function SpendingUniverse({ planets, size = 320 }: Props) {
    const center = size / 2;

    // Single shared value that rotates from 0 to 360 over an hour, just looping forever
    // to power the orbital mechanics of all planets in relation to it.
    const masterTime = useSharedValue(0);
    const pulseAnim = useSharedValue(1);

    useEffect(() => {
        masterTime.value = withRepeat(
            withTiming(360, { duration: 60000, easing: Easing.linear }),
            -1,
            false
        );

        pulseAnim.value = withRepeat(
            withSequence(
                withTiming(1.6, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const pulseProps = useAnimatedProps(() => {
        return {
            r: 20 * pulseAnim.value,
            strokeWidth: 3 * pulseAnim.value,
            strokeOpacity: Math.max(0, 1 - (pulseAnim.value - 1) * 1.5),
        } as any;
    });

    if (!planets || planets.length === 0) {
        return (
            <View style={[styles.emptyContainer, { width: size, height: size }]}>
                <Text style={styles.emptyText}>Track expenses to populate your universe</Text>
            </View>
        );
    }

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size}>

                {/* The Solar Center (Salary / Balance) */}
                <AnimatedCircle
                    cx={center}
                    cy={center}
                    fill="none"
                    stroke="#D3A77A"
                    animatedProps={pulseProps}
                />
                <Circle
                    cx={center}
                    cy={center}
                    r={20}
                    fill="#D3A77A"
                    opacity={0.8}
                />
                <Circle
                    cx={center}
                    cy={center}
                    r={25}
                    fill="none"
                    stroke="#D3A77A"
                    strokeWidth={1}
                    opacity={0.3}
                />

                {/* Orbit Rings & Planets */}
                {planets.map((planet, index) => (
                    <Planet
                        key={`orbit-${index}`}
                        planet={planet}
                        center={center}
                        masterTime={masterTime}
                    />
                ))}
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    emptyContainer: {
        backgroundColor: '#383633',
        borderRadius: 160,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#4E4B47',
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    emptyText: {
        color: '#A7A4A0',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
        width: '60%',
    }
});
