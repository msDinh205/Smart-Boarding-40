import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface ScoreChartProps {
  data: { day: string; score: number }[];
  title: string;
}

export default function ScoreChart({ data, title }: ScoreChartProps) {
  return (
    <div className="bg-white border border-[#141414] p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-4 h-4" />
        <h2 className="font-serif italic text-lg">{title}</h2>
      </div>
      
      <div className="h-[250px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#141414', fontSize: 10, fontFamily: 'monospace' }}
            />
            <YAxis 
              domain={[0, 10]} 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#141414', fontSize: 10, fontFamily: 'monospace' }}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '0', 
                border: '1px solid #141414',
                fontFamily: 'monospace',
                fontSize: '10px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#15803d" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#15803d', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
