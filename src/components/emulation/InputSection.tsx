import React from 'react';
import { Sparkles, RefreshCw, TrendingUp, ClipboardList, Plus, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { WeeklyData, Violation, VIOLATION_LABELS } from '../../types';

interface InputSectionProps {
  rawInput: string;
  setRawInput: (val: string) => void;
  isProcessing: boolean;
  onProcessRawData: () => void;
  data: WeeklyData;
  setData: (data: WeeklyData) => void;
  addViolation: (dayIdx: number) => void;
  removeViolation: (dayIdx: number, vIdx: number) => void;
  updateViolation: (dayIdx: number, vIdx: number, field: keyof Violation, value: any) => void;
  onViewResults: () => void;
}

export default function InputSection({
  rawInput,
  setRawInput,
  isProcessing,
  onProcessRawData,
  data,
  setData,
  addViolation,
  removeViolation,
  updateViolation,
  onViewResults
}: InputSectionProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* Quick Input Section */}
      <section className="bg-white border border-[#141414] p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4" />
          <h2 className="font-serif italic text-lg">Nhập nhanh bằng văn bản</h2>
        </div>
        <textarea 
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          placeholder="Ví dụ: Thứ 6 lớp sạch nhưng phòng 201 bẩn (-2), Thứ 2 có 1 bạn hút thuốc (-5). Tuần này có 15 điểm 10. Sổ đầu bài 9.5..."
          className="w-full h-32 p-4 bg-[#F5F5F3] border border-[#141414] focus:outline-none focus:ring-1 focus:ring-[#141414] font-mono text-sm resize-none"
        />
        <button 
          onClick={onProcessRawData}
          disabled={isProcessing || !rawInput.trim()}
          className="mt-4 w-full py-3 bg-[#141414] text-[#E4E3E0] font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
          {isProcessing ? "Đang xử lý..." : "Phân tích & Tự động điền"}
        </button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Manual Input - Daily Records */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList className="w-4 h-4" />
            <h2 className="font-serif italic text-lg">Chi tiết nề nếp (Thứ 6 - Thứ 5)</h2>
          </div>
          
          {data.dailyRecords.map((record, dIdx) => (
            <div key={record.day} className="bg-white border border-[#141414] overflow-hidden">
              <div className="bg-[#141414] text-[#E4E3E0] px-4 py-2 flex justify-between items-center">
                <span className="font-mono text-xs uppercase tracking-widest">{record.day}</span>
                <span className="font-mono text-[10px] opacity-70">Điểm gốc: {record.baseScore}</span>
              </div>
              <div className="p-4 space-y-3">
                {record.violations.length === 0 && (
                  <p className="text-xs text-center py-4 opacity-40 italic">Không có lỗi vi phạm</p>
                )}
                {record.violations.map((v, vIdx) => (
                  <div key={vIdx} className="grid grid-cols-12 gap-2 items-center border-b border-dashed border-[#141414]/20 pb-2">
                    <select 
                      value={v.type}
                      onChange={(e) => updateViolation(dIdx, vIdx, 'type', e.target.value)}
                      className="col-span-5 text-[11px] p-1 border border-[#141414] bg-white font-mono"
                    >
                      {Object.entries(VIOLATION_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                    <input 
                      type="text"
                      value={v.description}
                      placeholder="Mô tả..."
                      onChange={(e) => updateViolation(dIdx, vIdx, 'description', e.target.value)}
                      className="col-span-4 text-[11px] p-1 border border-[#141414] bg-white font-mono"
                    />
                    <input 
                      type="number"
                      value={v.count}
                      min="1"
                      onChange={(e) => updateViolation(dIdx, vIdx, 'count', parseInt(e.target.value) || 1)}
                      className="col-span-2 text-[11px] p-1 border border-[#141414] bg-white font-mono text-center"
                    />
                    <button 
                      onClick={() => removeViolation(dIdx, vIdx)}
                      className="col-span-1 flex justify-center text-red-600 hover:scale-110 transition-transform"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => addViolation(dIdx)}
                  className="w-full py-2 border border-dashed border-[#141414] text-[10px] uppercase font-mono flex items-center justify-center gap-1 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Thêm lỗi
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Inputs */}
        <div className="space-y-6">
          <div className="bg-white border border-[#141414] p-6 space-y-6">
            <div>
              <h3 className="font-serif italic text-md mb-3">Điểm Sổ Đầu Bài</h3>
              <input 
                type="number"
                step="0.1"
                max="10"
                min="0"
                value={data.classLogScore}
                onChange={(e) => setData({...data, classLogScore: parseFloat(e.target.value) || 0})}
                className="w-full p-2 border border-[#141414] font-mono text-sm"
              />
            </div>

            <div>
              <h3 className="font-serif italic text-md mb-3">Số lượng điểm 9, 10</h3>
              <input 
                type="number"
                min="0"
                value={data.goodGradesCount}
                onChange={(e) => setData({...data, goodGradesCount: parseInt(e.target.value) || 0})}
                className="w-full p-2 border border-[#141414] font-mono text-sm"
              />
              <p className="text-[10px] mt-1 opacity-50 font-mono italic">Dùng để tính điểm thưởng (T)</p>
            </div>

            <div>
              <h3 className="font-serif italic text-md mb-3">Vi phạm cuối tuần</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={data.weekendViolations.saturday}
                    onChange={(e) => setData({...data, weekendViolations: {...data.weekendViolations, saturday: e.target.checked}})}
                    className="w-4 h-4 accent-[#141414]"
                  />
                  <span className="font-mono text-xs uppercase tracking-tighter group-hover:underline">Thứ 7 có lỗi (-2đ)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={data.weekendViolations.sunday}
                    onChange={(e) => setData({...data, weekendViolations: {...data.weekendViolations, sunday: e.target.checked}})}
                    className="w-4 h-4 accent-[#141414]"
                  />
                  <span className="font-mono text-xs uppercase tracking-tighter group-hover:underline">Chủ nhật có lỗi (-2đ)</span>
                </label>
              </div>
            </div>
          </div>

          <button 
            onClick={onViewResults}
            className="w-full py-4 bg-[#141414] text-[#E4E3E0] font-mono text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            Xem kết quả & Nhận xét
          </button>
        </div>
      </div>
    </motion.div>
  );
}
