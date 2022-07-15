from typing import List
import pandas as pd
import json

C9_ONLY = False
c9_universities = [
    '清华大学',
    '北京大学',
    '复旦大学',
    '上海交通大学',
    '哈尔滨工业大学',
    '中国科学院大学',
    '西安交通大学',
    '浙江大学',
    '南京大学',
]

type_map = {
    '综合': 'composite',
    '师范语言': 'normal',
    '理工': 'science',
    '农林': 'agriculture',
    '医药': 'medicine',
    '军事': 'military',
    '财经政法': 'finance',
    '民族艺体': 'arts',
}

data_info = pd.read_csv('data/uniinfo-0716.csv')
data_history = pd.read_csv('data/unidata-0715.csv')
output_file = 'src/data/uni_info.json'

output = []


def get_events(university: str) -> List:
    events = []
    history = list(zip(data_history["DATE"].round(2), university))
    return events


def main():

    for row in data_info.iloc():
        uni_info = dict(row)
        if C9_ONLY:
            if not uni_info['university'] in c9_universities:
                continue
        print(f'Processing {uni_info["university"]}')
        if uni_info['type'] not in type_map.keys():
            print(f'Unknown type {uni_info["type"]}')
        info = {
            'name':
                uni_info['university'],
            'englishName':
                uni_info['english_name'],
            'establishYear':
                int(str('%.2f' % uni_info['established']).split('.')[0]),
            'establishMonth':
                int(str('%.2f' % uni_info['established']).split('.')[1]),
            'location':
                uni_info['location'],
            'type': type_map[uni_info['type']],
            'c9':
                False,
            '985': uni_info['level'].find('985') != -1,
            '211': uni_info['level'].find('211') != -1,
        }
        # Deal with 湖南大学
        info['establishYear'] = max(info['establishYear'], 1800)
        if uni_info['university'] in c9_universities:
            info['c9'] = True
        output.append(info)

    with open(output_file, 'w') as f:
        f.write(json.dumps(output, indent=4, ensure_ascii=False))


if __name__ == '__main__':
    main()