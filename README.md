# HCU - History of Chinese University

![1665477650178](https://billc.oss-cn-shanghai.aliyuncs.com/v2/img/2022/10/11/1665477650178.png)

这里展示了中国高校的建校、改名、迁址、合并等历史轨迹。数据范围为截至 2022 年的「双一流建设高校」与「双一流建设学科」名单。这是 PKU 2022 可视化暑期夏令营的课程作品，详细介绍见[暑期学校课程设计作品 - 中国高校历史沿革](https://mp.weixin.qq.com/s/IvFwuXp8RNBzFUzdNRM7LA)。

We visualized the historical trajectory of Chinese universities in terms of establishment, name change, relocation and restructure. The scope of data is the list of "double first-class universities" and "double first-class disciplines" up to 2022. For furthur introduction, please refer to [Summer School Course Design Project - History of Chinese Universities](https://mp.weixin.qq.com/s/IvFwuXp8RNBzFUzdNRM7LA) (Chinese).


## Data

The data is collected from the official websites of universities and their wikipedia pages. `data/uniinfo-xxxx.csv` is the meta data of the universities, including their English names, locations, governing apartment and establish date; `data/unidata-xxxx.csv` contains the major historical events of the universities, with year and month as row, university as columns. Four types of events are considered: establish, rename, relocation and restructure. `scripts/info_extractor.py` will extract data from them and generate `/src/data/details/uni_(event|detail|trend).json`.

## Development

This project is primarily built with React, TypeScript and D3.js. `src/lib/.*Manager.ts` handles the visualization rendering and interaction logic.

```
yarn
yarn start
```

Feel free to open pull requests if you find anything wrong.
