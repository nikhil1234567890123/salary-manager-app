import { Ionicons } from '@expo/vector-icons';

export interface Transaction {
    id: string;
    type: "income" | "expense";
    amount: number;
    category: string;
    source: "manual" | "sms";
    date: number; // timestamp
    note?: string;
    merchant?: string;
}

export interface CityBuildingData {
    id: string;
    category: string;
    amount: number;
    height: number; // Normalized height (0-100 or absolute pixels)
    color: string;
    percentage: number; // Percentage of total salary
    transactionCount: number;
    icon: keyof typeof Ionicons.glyphMap;
}

export interface MoneyCityProps {
    buildings: CityBuildingData[];
    totalSalary: number;
    onBuildingPress: (building: CityBuildingData) => void;
    isLoading?: boolean;
}

export interface CitySkylingProps {
    buildings: CityBuildingData[];
    containerHeight: number;
    onBuildingPress: (building: CityBuildingData) => void;
}
