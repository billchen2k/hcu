export interface IUniversityInfo {
    name: string;
    englishName: string;
    establishYear: number;
    establishMonth: number;
    manager: string;
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

export interface IUniversityEventConfig {
    color: string;
    name: string;
    priority?: number;
}


export type UniversityType = 'composite' | 'normal' | 'science' | 'agriculture' | 'finance' | 'military' | 'medicine' | 'arts';

export type UniversityEventType = 'rename' | 'relocation' | 'restructure'

export interface IUniversityEvent {
    university: string;
    event: UniversityEventType;
    detail: {
        name?: string;
        source?: string;
        target?: string;
    };
    year: number;
}
