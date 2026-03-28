import React from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIAnalysisProps {
  analysis: string | null;
  onGenerate: () => void;
  isGenerating: boolean;
  error?: string | null;
}

export const AIAnalysis: React.FC<AIAnalysisProps> = ({
  analysis,
  onGenerate,
  isGenerating,
  error
}) => {
  return (
    <div className="bg-white border border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-serif italic font-bold tracking-tight text-[#141414] flex items-center gap-3">
            <MessageSquare size={24} />
            Nhận xét & Tư vấn từ AI
          </h2>
          <p className="text-[11px] uppercase tracking-widest text-gray-500 font-mono mt-1">Phân tích chuyên sâu bởi Google Gemini 1.5</p>
        </div>
        <button 
          onClick={onGenerate}
          disabled={isGenerating}
          className="px-6 py-2.5 bg-green-600 text-white font-mono text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20 disabled:opacity-50"
        >
          <Sparkles size={14} className={isGenerating ? "animate-spin" : ""} />
          {isGenerating ? "Đang phân tích..." : "Cập nhật Nhận xét"}
        </button>
      </div>

      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed font-sans min-h-[100px]">
        {error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm font-mono whitespace-pre-wrap">
            <strong>Lỗi AI:</strong> {error}
          </div>
        ) : analysis ? (
          <ReactMarkdown>{analysis}</ReactMarkdown>
        ) : (
          <p className="italic text-gray-400">
            {isGenerating ? "Đang lắng nghe dữ liệu và suy luận..." : "Nhấn nút 'Cập nhật Nhận xét' để AI phân tích kết quả tuần này."}
          </p>
        )}
      </div>
    </div>
  );
};
