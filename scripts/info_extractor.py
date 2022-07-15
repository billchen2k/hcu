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

data = pd.read_csv('data/uniinfo-0715.csv')

output = []

for row in data.iloc():
    uni_info = dict(row)
    if C9_ONLY:
        if not uni_info['university'] in c9_universities:
            continue
    print(f'Processing {uni_info["university"]}')
    info = {
        'name': uni_info['university'],
        'englishName': uni_info['english_name'],
        'establishYear': str('%.2f' % uni_info['established']).split('.')[0],
        'establishMonth': str('%.2f' % uni_info['established']).split('.')[1],
        'location': uni_info['location'],
        'c9': False
    }
    if uni_info['university'] in c9_universities:
        info['c9'] = True
    output.append(info)

with open('data/uni_info.json', 'w') as f:
    f.write(json.dumps(output, indent=4, ensure_ascii=False))