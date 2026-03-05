import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    FlatList,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Slide {
    id: string;
    emoji: string;
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
}

const slides: Slide[] = [
    {
        id: '1',
        emoji: '💰',
        icon: 'wallet',
        title: 'Track Your Salary',
        description:
            'Set up your monthly salary and fixed expenses. Know exactly how much you have to work with each month.',
    },
    {
        id: '2',
        emoji: '📊',
        icon: 'bar-chart',
        title: 'Control Daily Spending',
        description:
            'Get a smart daily spending limit calculated for you. Log every expense and stay within safe limits.',
    },
    {
        id: '3',
        emoji: '🎯',
        icon: 'trending-up',
        title: 'Monitor Savings',
        description:
            'Watch your savings grow over time. Visual charts show your progress and keep you motivated.',
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
    };

    const handleNext = async () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            });
        } else {
            await AsyncStorage.setItem('@onboarding_complete', 'true');
            router.replace('/(tabs)');
        }
    };

    const handleSkip = async () => {
        await AsyncStorage.setItem('@onboarding_complete', 'true');
        router.replace('/(tabs)');
    };

    const renderSlide = ({ item }: { item: Slide }) => (
        <View style={{ width }} className="flex-1 items-center justify-center px-8">
            {/* Illustration Circle — Dark/Gold themed */}
            <Animated.View
                entering={FadeInDown.duration(600)}
                className="w-44 h-44 rounded-full bg-[#383633] items-center justify-center mb-10 border-[3px] border-[#A87D56] shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
            >
                <View className="w-[120px] h-[120px] rounded-full bg-[#2C2B29] border border-[#5D5A54] items-center justify-center">
                    <Ionicons name={item.icon} size={52} color="#D3A77A" />
                </View>
            </Animated.View>

            {/* Title */}
            <Animated.Text
                entering={FadeInDown.duration(600).delay(100)}
                className="text-3xl font-extrabold text-[#D3A77A] text-center mb-4"
            >
                {item.title}
            </Animated.Text>

            {/* Description */}
            <Animated.Text
                entering={FadeInDown.duration(600).delay(200)}
                className="text-base text-[#A7A4A0] text-center leading-6 px-4"
            >
                {item.description}
            </Animated.Text>
        </View>
    );

    const isLastSlide = currentIndex === slides.length - 1;

    return (
        <View className="flex-1 bg-[#2C2B29]">
            <StatusBar style="light" />

            {/* Subtle background decor */}
            <View className="absolute -top-[10%] -right-[30%] w-[80%] h-[50%] rounded-full bg-[#D3A77A] opacity-[0.05]" />
            <View className="absolute -bottom-[15%] -left-[20%] w-[60%] h-[40%] rounded-full bg-[#D3A77A] opacity-[0.04]" />

            {/* Skip button */}
            <TouchableOpacity
                onPress={handleSkip}
                className="absolute top-14 right-6 z-10 py-2 px-4"
            >
                <Text className="text-[#A7A4A0] font-bold text-sm tracking-widest uppercase">Skip</Text>
            </TouchableOpacity>

            {/* Slides */}
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderSlide}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                bounces={false}
            />

            {/* Bottom Section */}
            <Animated.View
                entering={FadeInUp.duration(600).delay(300)}
                className="pb-12 px-8 items-center"
            >
                {/* Pagination dots */}
                <View className="flex-row mb-8">
                    {slides.map((_, i) => (
                        <View
                            key={i}
                            className={`h-2 rounded-full mx-1.5 ${i === currentIndex
                                    ? 'w-8 bg-[#D3A77A]'
                                    : 'w-2 bg-[#4E4B47]'
                                }`}
                        />
                    ))}
                </View>

                {/* Action Button — Premium Gold */}
                <TouchableOpacity
                    onPress={handleNext}
                    activeOpacity={0.8}
                    className="w-full rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.6)]"
                    style={{ elevation: 15 }}
                >
                    <View className="py-5 rounded-full items-center justify-center flex-row bg-[#D1A677] border-t border-t-[#EACFA7] border-b border-b-[#A87D56]">
                        <Text className="text-[#2B231A] font-extrabold text-[15px] tracking-wide mr-2">
                            {isLastSlide ? 'Get Started' : 'Next'}
                        </Text>
                        <Ionicons name="arrow-forward" size={18} color="#2B231A" />
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}
