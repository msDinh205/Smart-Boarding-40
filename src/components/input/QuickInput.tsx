import React, { useState } from 'react';
import { Sparkles, TrendingUp, RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WeeklyData, VIOLATION_LABELS } from '../../types';

interface QuickInputProps {
  onProcess: (text: string) => Promise<void>;
  isProcessing: boolean;
  pendingData: Partial<WeeklyData> | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const QuickInput: React.FC<QuickInputProps> = ({
  onProcess,
  isProcessing,
  pendingData,
  onConfirm,
  onCancel
}) => {
  const [rawInput, setRawInput] = useState('');

  const handleProcess = () => {
    if (rawInput.trim()) {
      onProcess(rawInput);
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-white border border-[#141414] p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4" />
          <h2 className="font-serif italic text-lg text-[#141414]">Nhập nhanh bằng văn bản</h2>
        </div>
        <textarea 
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          placeholder="Ví dụ: Thứ 6 lớp sạch nhưng phòng 201 bẩn (-2), Thứ 2 có 1 bạn hút thuốc (-5). Tuần này có 15 điểm 10. Sổ đầu bài 9.5..."
          className="w-full h-32 p-4 bg-[#F5F5F3] border border-[#141414] focus:outline-none focus:ring-1 focus:ring-[#141414] font-mono text-sm resize-none"
        />
        <button 
          onClick={handleProcess}
          disabled={isProcessing || !rawInput.trim()}
          className="mt-4 w-full py-3 bg-[#141414] text-[#E4E3E0] font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
          {isProcessing ? "Đang xử lý..." : "AI Gợi ý Dữ liệu"}
        </button>
      </section>

      <AnimatePresence>
        {pendingData && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-yellow-50 border-2 border-yellow-400 p-6 relative"
          >
            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
              AI Gợi ý
            </div>
            <h3 className="font-serif italic text-lg text-yellow-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Vui lòng kiểm tra dữ liệu AI trích xuất
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm font-mono">
              <div>
                <p className="font-bold text-yellow-800">Sổ Đầu Bài: <span className="font-normal text-black">{pendingData.classLogScore}</span></p>
                <p className="font-bold text-yellow-800">Điểm 9, 10: <span className="font-normal text-black">{pendingData.goodGradesCount}</span></p>
                <p className="font-bold text-yellow-800">Vi phạm T7/CN: <span className="font-normal text-black text-xs uppercase">
                  {pendingData.weekendViolations?.saturday ? 'THỨ 7 ' : ''}
                  {pendingData.weekendViolations?.sunday ? 'CHỦ NHẬT ' : ''}
                  {!pendingData.weekendViolations?.saturday && !pendingData.weekendViolations?.sunday ? 'KHÔNG' : ''}
                </span></p>
              </div>
              <div className="text-xs">
                <p className="font-bold text-yellow-800 mb-1">Vi phạm trong tuần:</p>
                <ul className="list-disc pl-4 text-black space-y-1">
                  {pendingData.dailyRecords?.map(r => 
                    r.violations.length > 0 ? (
                      <li key={r.day}>
                        <strong>{r.day}:</strong> {r.violations.map(v => `${VIOLATION_LABELS[v.type]} (x${v.count})`).join(', ')}
                      </li>
                    ) : null
                  )}
                  {pendingData.dailyRecords?.every(r => r.violations.length === 0) && (
                    <li className="italic opacity-50">Không phát hiện vi phạm.</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={onConfirm}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Xác nhận & Áp dụng
              </button>
              <button 
                onClick={onCancel}
                className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2 px-4 transition-colors text-sm"
              >
                Hủy bỏ
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
