import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';

export function useImpact() {
    /**
     * light: A subtle, soft tap. Good for toggle switches or minor taps.
     */
    const light = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, []);

    /**
     * medium: A noticeable tap. Good for main buttons and generic interactions.
     */
    const medium = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, []);

    /**
     * heavy: A strong tap. Good for critical actions or significant changes.
     */
    const heavy = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, []);

    /**
     * success: A satisfying "double tap" notification. Great for transaction confirm.
     */
    const success = useCallback(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, []);

    /**
     * error: A rapid triple vibration. Good for failures.
     */
    const error = useCallback(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }, []);

    return { light, medium, heavy, success, error };
}
