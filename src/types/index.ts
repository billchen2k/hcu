export interface IUniversityInfo {
    name: string;
    englishName: string;
    establishYear: number;
    establishMonth: number;
    location: string;
    logo?: string;
    985: boolean;
    211: boolean;
    c9: boolean;
}

export interface IUniversityTypeConfig {
    color: string;
    name: string;
    priority: number;
    icon?: string;
}

export type UniversityType = 'composite' | 'normal' | 'science' | 'agriculture' | 'finance' | 'military' | 'medicine' | 'arts';
