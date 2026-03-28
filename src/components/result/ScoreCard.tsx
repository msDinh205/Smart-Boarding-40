import React from 'react';
import { Calculator, AlertCircle } from 'lucide-react';
import { WeeklyData } from '../../types';

interface ScoreCardProps {
  results: any;
  data: WeeklyData;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ results, data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white border border-[#141414] p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
        <div className="flex items-center gap-2 mb-2 text-gray-500 uppercase text-[10px] font-bold tracking-widest font-mono">
          <Calculator size={14} />
          Điểm Nề nếp (N)
        </div>
        <div className="text-4xl font-serif italic font-bold text-[#141414]">
          {results.N.toFixed(2)}
        </div>
        <p className="text-[10px] text-gray-400 mt-2 font-mono">Trung bình cộng 5 ngày</p>
      </div>

      <div className="bg-white border border-[#141414] p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
        <div className="flex items-center gap-2 mb-2 text-gray-500 uppercase text-[10px] font-bold tracking-widest font-mono">
          <AlertCircle size={14} />
          Điểm Sổ đầu bài
        </div>
        <div className="text-4xl font-serif italic font-bold text-[#141414]">
          {data.classLogScore.toFixed(1)}
        </div>
        <p className="text-[10px] text-gray-400 mt-2 font-mono">Dữ liệu từ giáo viên</p>
      </div>

      <div className="bg-white border border-[#141414] p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
        <div className="flex items-center gap-2 mb-2 text-gray-500 uppercase text-[10px] font-bold tracking-widest font-mono">
          <Sparkles size={14} className="text-yellow-500" />
          Điểm Thưởng (T)
        </div>
        <div className="text-4xl font-serif italic font-bold text-yellow-600">
          +{results.T}
        </div>
        <p className="text-[10px] text-gray-400 mt-2 font-mono">{data.goodGradesCount} điểm 9, 10</p>
      </div>

      <div className="bg-[#141414] border border-[#141414] p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
        <div className="flex items-center gap-2 mb-2 text-gray-400 uppercase text-[10px] font-bold tracking-widest font-mono">
          <Calculator size={14} />
          Tổng điểm (S)
        </div>
        <div className="text-4xl font-serif italic font-bold text-[#E4E3E0]">
          {results.S.toFixed(2)}
        </div>
        <p className="text-[10px] text-gray-400 mt-2 font-mono">0.45N+0.45SĐB+0.1T-L</p>
      </div>
    </div>
  );
};
