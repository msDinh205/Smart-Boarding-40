import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, RefreshCw, MessageSquare } from 'lucide-react';

interface AIAnalyzerProps {
  analysis: string | null;
  isGenerating: boolean;
}

export default function AIAnalyzer({ analysis, isGenerating }: AIAnalyzerProps) {
  return (
    <section className="bg-white border border-[#141414] p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-2 opacity-5">
        <MessageSquare className="w-24 h-24" />
      </div>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-amber-600" />
        <h2 className="font-serif italic text-lg">Nhận xét từ Trợ lý AI</h2>
      </div>
      <div className="prose prose-sm max-w-none font-serif text-[#333] leading-relaxed">
        {analysis ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        ) : isGenerating ? (
          <div className="flex items-center gap-2 opacity-40 italic">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Đang tạo nhận xét...</span>
          </div>
        ) : (
          <p className="opacity-40 italic">Chưa có nhận xét. Vui lòng kiểm tra lại dữ liệu và nhấn "Xem kết quả".</p>
        )}
      </div>
    </section>
  );
}
