import React from 'react';
import { TrendingUp, Award } from 'lucide-react';
import { ClassName } from '../../types';

interface RankingTableProps {
  rankingData: {
    thcs: { name: ClassName, score: number }[];
    thpt: { name: ClassName, score: number }[];
    bottomThcs: { name: ClassName, score: number }[];
    bottomThpt: { name: ClassName, score: number }[];
  };
  selectedClass: ClassName;
}

export const RankingTable: React.FC<RankingTableProps> = ({ rankingData, selectedClass }) => {
  const renderRankList = (list: { name: ClassName, score: number }[], title: string, isTop: boolean = true) => (
    <div className="space-y-4">
      <h3 className="font-serif italic font-bold text-lg flex items-center gap-2">
        <Award className={isTop ? "text-yellow-500" : "text-red-500"} size={20} />
        {title}
      </h3>
      <div className="space-y-2">
        {list.map((item, index) => (
          <div 
            key={item.name}
            className={`flex justify-between items-center p-3 border ${
              item.name === selectedClass 
                ? "bg-green-50 border-green-600 font-bold" 
                : "bg-white border-gray-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono ${
                index === 0 && isTop ? "bg-yellow-400 text-yellow-900" : "bg-gray-100 text-gray-500"
              }`}>
                {index + 1}
              </span>
              <span className="font-mono">Lớp {item.name}</span>
            </div>
            <span className="font-serif italic text-green-700">{item.score.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-8">
        {renderRankList(rankingData.thcs, "Xếp hạng THCS (Khối 6-9)")}
        {renderRankList(rankingData.thpt, "Xếp hạng THPT (Khối 10-12)")}
      </div>
      
      <div className="space-y-8 bg-[#F5F5F3] p-6 border border-[#141414]">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5" />
          <h2 className="font-serif italic text-xl font-bold">Lưu ý chấn chỉnh</h2>
        </div>
        <p className="text-sm text-gray-600 mb-6">Danh sách các lớp có điểm thi đua thấp nhất tuần này cần GVCN và Ban cán sự phối hợp sát sao.</p>
        
        {renderRankList(rankingData.bottomThcs, "Cần chấn chỉnh THCS", false)}
        <div className="h-4"></div>
        {renderRankList(rankingData.bottomThpt, "Cần chấn chỉnh THPT", false)}
      </div>
    </div>
  );
};
