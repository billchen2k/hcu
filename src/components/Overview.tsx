import * as React from 'react';
import UniInfo from '../data/uni_info.json';
export interface IOverviewProps {
}

export default function Overview(props: IOverviewProps) {
  return (
    <div>
        Overview
      {JSON.stringify(UniInfo)}
    </div>
  );
}
