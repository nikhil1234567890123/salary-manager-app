import { useEffect } from 'react';
import {
    useSharedValue,
    withRepeat,
    withTiming,
    Easing,
    useAnimatedProps,
    SharedValue
} from 'react-native-reanimated';

interface UseSolarOrbitProps {
    radius: number;
    speedMs: number;
    initialAngle?: number;
    center: number;
}

export function useSolarOrbit({ radius, speedMs, initialAngle = 0, center }: UseSolarOrbitProps) {
    // We animate an angle from 0 to 360 degrees
    const angle = useSharedValue(initialAngle);

    useEffect(() => {
        angle.value = withRepeat(
            withTiming(initialAngle + 360, {
                duration: speedMs,
                easing: Easing.linear,
            }),
            -1, // Infinite repeat
            false // Do not reverse, keep going in a circle
        );
    }, [speedMs, initialAngle]);

    // Calculate X and Y coordinates on the UI thread using trigonometry
    const animatedProps = useAnimatedProps(() => {
        const angleRad = (angle.value * Math.PI) / 180;

        // Circular orbit equations
        const x = center + radius * Math.cos(angleRad);
        const y = center + radius * Math.sin(angleRad);

        return {
            x: x,
            y: y,
        } as any;
    });

    return { animatedProps, angle };
}
