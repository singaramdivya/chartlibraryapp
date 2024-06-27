import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import TimeframeButtons from './TimeframeButtons';
import './styles.css';

interface DataPoint {
  timestamp: string;
  value: number;
}

interface ChartProps {
  isDarkMode: boolean;
}

const Chart: React.FC<ChartProps> = ({isDarkMode}) => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [initialData, setInitialData] = useState<DataPoint[]>([]);
  const [timeframe, setTimeframe] = useState<string>('day');

  useEffect(() => {
    fetchData();
  }, [timeframe]);

  const fetchData = () => {
    fetch('/data.json')
      .then(response => response.json())
      .then(jsonData => {
        const formattedData = jsonData.map((item: any) => ({
          timestamp: item.timestamp,
          value: item.value
        }));
        setInitialData(formattedData);
        setData(getDataForTimeframe(timeframe, formattedData));
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  };

  const getDataForTimeframe = (timeframe: string, data: DataPoint[]): DataPoint[] => {
    switch (timeframe) {
      case 'day':
        return aggregateData(data, 'day');
      case 'week':
        return aggregateData(data, 'week');
      case 'month':
        return aggregateData(data, 'month');
      case 'year':
        return aggregateYearlyData(data);
      default:
        return [];
    }
  };

  const aggregateData = (data: DataPoint[], granularity: string): DataPoint[] => {
    const aggregatedData: DataPoint[] = [];
    const buckets: { [key: string]: DataPoint[] } = {};

    data.forEach(point => {
      const bucketKey = getBucketKey(point.timestamp, granularity);
      if (!buckets[bucketKey]) {
        buckets[bucketKey] = [];
      }
      buckets[bucketKey].push(point);
    });

    for (const bucketKey in buckets) {
      const points = buckets[bucketKey];
      const totalValue = points.reduce((acc, cur) => acc + cur.value, 0);
      aggregatedData.push({ timestamp: bucketKey, value: totalValue });
    }

    return aggregatedData;
  };

  const aggregateYearlyData = (data: DataPoint[]): DataPoint[] => {
    const yearlyData: { [year: string]: number } = {};

    data.forEach(point => {
      const year = new Date(point.timestamp).getFullYear().toString();
      if (!yearlyData[year]) {
        yearlyData[year] = 0;
      }
      yearlyData[year] += point.value;
    });

    return Object.keys(yearlyData).map(year => ({ timestamp: year, value: yearlyData[year] }));
  };

  const getBucketKey = (timestamp: string, granularity: string): string => {
    const date = new Date(timestamp);
    switch (granularity) {
      case 'day':
        return date.toISOString().split('T')[0];
      case 'week':
        return getISOWeek(timestamp);
      case 'month':
        return date.toISOString().substr(0, 7);
      default:
        return '';
    }
  };

  const getISOWeek = (dateString: string): string => {
    const date = new Date(dateString);
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil((((date.valueOf() - yearStart.valueOf()) / 86400000) + 1) / 7);

    return `${date.getUTCFullYear()}-W${weekNumber}`;
  };

  const handleDataPointClick = (data: any) => {
    const clickedYear = new Date(data.activeLabel).getFullYear().toString();
    const filteredData = initialData.filter(point => {
      const year = new Date(point.timestamp).getFullYear().toString();
      return year === clickedYear;
    });
    setData(filteredData);
  };

  const handleExport = () => {
    html2canvas(document.querySelector('#chart-container')!).then(canvas => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'chart.png';
      link.click();
    });
  };

  return (
    <div className={`ChartContainer ${isDarkMode ? 'dark-mode' : ''}`}>
      <TimeframeButtons setTimeframe={setTimeframe} />
      <div className={`ChartContainer ${isDarkMode ? 'dark-mode' : ''}`}>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} onClick={handleDataPointClick}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <button onClick={handleExport}>Export as PNG</button>
    </div>
  );
};

export default Chart;
