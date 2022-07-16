from asyncio import unix_events
import random
from typing import List
from numpy import void
import pandas as pd
import json
import re
import os

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
data_event = pd.read_csv('data/unidata-0715.csv')
info_output_file = 'src/data/uni_info.json'
event_output_file = 'src/data/uni_event.json'
logo_dir = 'public/assets/logo'

info_output = []
event_output = []


class Event:

    EVENT_RENAME = 'rename'
    EVENT_RELOCATION = 'relocation'
    EVENT_RESTRUCTURE = 'restructure'

    def __init__(self, event: str, university, year: int) -> None:
        self.event = event
        self.event_type = None
        self.detail = {}
        self.university = university
        self.year = year

    def match_event(self) -> bool:
        if match := re.match(r'更名：(.+)$', self.event):
            self.event_type = self.EVENT_RENAME
            self.detail = {'name': match.group(1)}
            return True
        if match := re.match(r'迁址：由(?P<location>.+)迁往(?P<location1>.+)$',
                             self.event):
            self.event_type = self.EVENT_RELOCATION
            self.detail = {'source': match.group(1), 'target': match.group(2)}
            return True
        if match := re.match(r'院校合并：与([^、]+、)*([^、]+)合并成立(.+)', self.event):
            self.event_type = self.EVENT_RESTRUCTURE
            self.detail = {'target': match.group(2)}
            return True
        if match := re.match(
                r'院系(迁出|迁入)：([^-、]+-[^-、]+、)*([^-、]+-[^-、]+)并入(.+)',
                self.event):
            self.event_type = self.EVENT_RESTRUCTURE
            self.detail = {'target': match.group(2)}
            return True
        return False

    def event_json(self) -> dict:
        return {
             'university': self.university,
            'event': self.event_type,
            'detail': self.detail,
            'year': self.year,
        }


def get_events(university: str) -> List:
    events = list(zip(data_event["DATE"].round(2), data_event[university]))
    events = list(filter(lambda x: not pd.isna(x[1]), events))
    return events


def get_university_logo(university_en_name: str) -> str:
    logos = os.listdir(logo_dir)
    for logo in logos:
        if logo.startswith(university_en_name):
            return logo
    return 'PKU.svg'


def main():

    for row in data_info.iloc():

        # Get info
        uni_info = dict(row)
        if C9_ONLY:
            if not uni_info['university'] in c9_universities:
                continue
        print(f'Processing info for {uni_info["university"]}')
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
            'type':
                type_map[uni_info['type']],
            'manager':
                uni_info['manager'],
            'c9':
                True if uni_info['C9'] == 1 else False,
            '985':
                uni_info['level'].find('985') != -1,
            '211':
                uni_info['level'].find('211') != -1,
            'logo':
                get_university_logo(uni_info['english_name']),
        }
        # Deal with 湖南大学
        info['establishYear'] = max(info['establishYear'], 1800)
        # if uni_info['university'] in c9_universities:
        #     info['c9'] = True
        info_output.append(info)

    ###############

    universities = data_event.columns[1:]
    for u in universities:
        print(f'Processing events for {u}...')
        counter = 0
        events = get_events(u)
        for date, event_str in events:
            if pd.isna(date):
                continue
            for event_str_item in event_str.split('；'):
                event = Event(event=event_str_item,
                              university=u,
                              year=int(str(date).split('.')[0]))
                if event.match_event():
                    counter += 1
                    event_output.append(event.event_json())
        print(f'{counter} events found for {u}')
    print(f'{len(event_output)} events found.')

    with open(info_output_file, 'w') as f:
        f.write(json.dumps(info_output, indent=4, ensure_ascii=False))

    with open(event_output_file, 'w') as f:
        f.write(json.dumps(event_output, indent=4, ensure_ascii=False))


if __name__ == '__main__':
    main()