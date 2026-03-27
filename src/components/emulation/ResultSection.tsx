import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Download, FileText, Calculator } from 'lucide-react';
import { WeeklyData, VIOLATION_LABELS, EDUCATIONAL_SOLUTIONS } from '../../types';
import ResultTable from './ResultTable';
import ScoreChart from './ScoreChart';
import AIAnalyzer from '../ai/AIAnalyzer';
import { cn } from '../../lib/utils';
import { exportToWord } from '../../lib/emulation';
import { FileText as FileWord } from 'lucide-react';

interface ResultSectionProps {
  selectedClass: string;
  selectedWeek: number;
  data: WeeklyData;
  results: any;
  comparativeAnalysis: any;
  aiAnalysis: string | null;
  isAiGenerating: boolean;
  onEditData: () => void;
  onShowMarkdown: () => void;
}

export default function ResultSection({
  selectedClass,
  selectedWeek,
  data,
  results,
  comparativeAnalysis,
  aiAnalysis,
  isAiGenerating,
  onEditData,
  onShowMarkdown
}: ResultSectionProps) {
  
  const chartData = data.dailyRecords.map((r, i) => ({
    day: r.day,
    score: results.dailyScores[i]
  }));

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="space-y-8 print:space-y-6"
    >
      {/* Print Header */}
      <div className="hidden print:block text-center mb-8">
        <h1 className="text-3xl font-serif italic font-bold">Báo Cáo Thi Đua Nội Trú</h1>
        <p className="text-lg font-mono mt-2">Lớp: {selectedClass} - Tuần: {selectedWeek}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#141414] p-4 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-mono uppercase opacity-50 mb-1">Nề nếp (N)</span>
          <span className="text-3xl font-serif italic">{results.N.toFixed(2)}</span>
        </div>
        <div className="bg-white border border-[#141414] p-4 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-mono uppercase opacity-50 mb-1">Sổ đầu bài</span>
          <span className="text-3xl font-serif italic">{data.classLogScore.toFixed(1)}</span>
        </div>
        <div className="bg-white border border-[#141414] p-4 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-mono uppercase opacity-50 mb-1">Thưởng (T)</span>
          <span className="text-3xl font-serif italic">+{results.T}</span>
        </div>
        <div className="bg-[#141414] text-[#E4E3E0] border border-[#141414] p-4 flex flex-col items-center justify-center text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
          <span className="text-[10px] font-mono uppercase opacity-50 mb-1">Tổng điểm (S)</span>
          <span className="text-4xl font-serif italic font-bold">{results.S.toFixed(2)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ResultTable 
            dailyRecords={data.dailyRecords}
            roomCount={data.roomCount}
            dailyScores={results.dailyScores}
            N={results.N}
            classLogScore={data.classLogScore}
            T={results.T}
            weekendDeduction={results.weekendDeduction}
            S={results.S}
          />
        </div>
        <div className="space-y-6">
          <ScoreChart data={chartData} title="Biểu đồ Điểm Nề nếp trong tuần" />
          
          {/* Trends Summary */}
          <section className="bg-white border border-[#141414] p-6">
            <div className="text-[10px] font-mono uppercase opacity-50 mb-4">Phân tích Xu hướng</div>
            {comparativeAnalysis.mostFrequentViolation ? (
              <div className="space-y-4">
                <div>
                  <span className="text-lg font-serif italic text-red-600 block">{comparativeAnalysis.mostFrequentViolation}</span>
                  <p className="text-[10px] font-mono opacity-70 mt-1">Vi phạm nhiều nhất ({comparativeAnalysis.maxCount} lần)</p>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200">
                  <div className="text-[10px] font-mono uppercase font-bold mb-1 text-amber-700">💡 Giải pháp:</div>
                  <p className="text-[11px] font-serif leading-relaxed italic">
                    {EDUCATIONAL_SOLUTIONS[comparativeAnalysis.mostFrequentViolationType as keyof typeof EDUCATIONAL_SOLUTIONS]}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs font-mono italic opacity-50">Cần thêm dữ liệu để phân tích xu hướng.</p>
            )}
          </section>
        </div>
      </div>

      <AIAnalyzer analysis={aiAnalysis} isGenerating={isAiGenerating} />

      <div className="flex flex-wrap justify-center gap-4 print:hidden">
        <button 
          onClick={() => exportToWord(data, results, selectedClass, selectedWeek, aiAnalysis)}
          className="px-6 py-3 bg-white border border-[#141414] font-mono text-xs uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2"
        >
          <FileWord className="w-4 h-4 text-blue-700" /> Xuất Word (.doc)
        </button>
        <button 
          onClick={onShowMarkdown}
          className="px-6 py-3 bg-white border border-[#141414] font-mono text-xs uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Xuất Markdown
        </button>
        <button 
          onClick={() => window.print()}
          className="px-6 py-3 bg-white border border-[#141414] font-mono text-xs uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2"
        >
          <FileText className="w-4 h-4" /> In báo cáo
        </button>
        <button 
          onClick={onEditData}
          className="px-6 py-3 bg-[#141414] text-[#E4E3E0] font-mono text-xs uppercase tracking-widest hover:bg-[#333] transition-all flex items-center gap-2"
        >
          <Calculator className="w-4 h-4" /> Chỉnh sửa dữ liệu
        </button>
      </div>
    </motion.div>
  );
}
