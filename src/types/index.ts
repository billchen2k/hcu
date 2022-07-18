export type UniversityType = 'composite' | 'normal' | 'science' | 'agriculture' | 'finance' | 'military' | 'medicine' | 'arts';
export type UniversityEventType = 'rename' | 'relocation' | 'restructure';
export type UniversityManagerType = 'central' | 'ministry_of_edu' | 'local';
export type UniversityDetailedEventType = 'rename' | 'relocation' | 'school_restructure' | 'major_restructure' | 'establish' | 'other';

export type SortingCriteria = 'default' | 'establishDate' | 'manager';

export interface IUniversityInfo {
    name: string;
    englishName: string;
    establishYear: number;
    establishMonth: number;
    manager: string;
    managerType: UniversityManagerType;
    location: string;
    type: UniversityType;
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
    trendColor?: string;
}

export interface IUniversityManagerConfig {
    name: string;
    priority?: number;
}

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

export interface IUniversityTrendItem {
    year: number;
    rename: number;
    relocation: number;
    restructure: number;
    iestablish: number;
}

export interface IUniversityDetailEventItem {
    // 时间年份
    year: number;
    // 事件类型。分别为更名，迁址，院校合并，专业系所合并（包括迁入、迁出），院校成立
    event: 'rename' | 'relocation' | 'school_restructure' | 'major_restructure' | 'establish' | 'other';
    // 仅存在于 school_restructure 和 major_restructure 中，表达了迁入的单位数量
    in_count?: number;
    // 仅存在于 school_restructure 和 major_restructure 中，表达了迁出的单位数量
    out_count?: number;
    // 事件细节（展示在右下角）标题。如果是更名，这里写更名的名称；迁址写迁移的地址；院校合并、专业系所合并就写院校合并 / 专业系所合并
    detail_heading?: string;
    // 事件细节（展示在右下角）内容。主要针对院校合并、专业系所，写合并的详细情况。对于 other 事件，也可以把整个事件放下来
    detail_content?: string;
}

export interface IUniversityDetail {
    // 学校中文名称
    name: string;
    // 学校英文名称
    en_name: string;
    // 学校简介，暂时随便填充文字，后期再人工整理
    description?: string;
    // 校训，留空，后期再人工整理。没有校训就没有校训。
    slogan?: string;
    // 事件细节
    events: IUniversityDetailEventItem[];
}

export type IUniversityDetailFile = Record<string, IUniversityDetail>
