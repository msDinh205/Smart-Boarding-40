import React from 'react';
import { Camera, Plus, Trash2, Info } from 'lucide-react';
import { WeeklyData, DailyRecord, Violation, VIOLATION_LABELS } from '../../types';

interface DailyInputProps {
  data: WeeklyData;
  setData: (d: WeeklyData) => void;
  onAnalyzeImage: (dayIndex: number) => void;
  analyzingImageDay: number | null;
}

export const DailyInput: React.FC<DailyInputProps> = ({
  data, setData, onAnalyzeImage, analyzingImageDay
}) => {
  const addViolation = (dayIndex: number) => {
    const newData = { ...data };
    newData.dailyRecords[dayIndex].violations.push({
      type: 'classroom',
      description: '',
      count: 1
    });
    setData(newData);
  };

  const removeViolation = (dayIndex: number, vIndex: number) => {
    const newData = { ...data };
    newData.dailyRecords[dayIndex].violations.splice(vIndex, 1);
    setData(newData);
  };

  const updateViolation = (dayIndex: number, vIndex: number, field: keyof Violation, value: any) => {
    const newData = { ...data };
    (newData.dailyRecords[dayIndex].violations[vIndex] as any)[field] = value;
    setData(newData);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.dailyRecords.map((record, dayIndex) => (
        <div key={record.day} className="bg-white border border-[#141414] p-5 flex flex-col h-full hover:shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] transition-all">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
            <h3 className="font-serif italic font-bold text-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              {record.day}
            </h3>
            <button 
              onClick={() => onAnalyzeImage(dayIndex)}
              className="p-2 text-gray-400 hover:text-green-600 transition-colors uppercase text-[10px] font-bold tracking-widest flex items-center gap-1"
            >
              {analyzingImageDay === dayIndex ? (
                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              ) : <Camera size={14} />}
              AI Scan
            </button>
          </div>

          <div className="space-y-3 flex-grow">
            {record.violations.map((v, vIndex) => (
              <div key={vIndex} className="bg-[#F5F5F3] p-3 border border-[#141414] relative group">
                <button 
                  onClick={() => removeViolation(dayIndex, vIndex)}
                  className="absolute -top-2 -right-2 bg-[#141414] text-white p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <Trash2 size={10} />
                </button>
                
                <select 
                  value={v.type}
                  onChange={(e) => updateViolation(dayIndex, vIndex, 'type', e.target.value)}
                  className="w-full bg-transparent text-xs font-mono font-bold mb-2 focus:outline-none"
                >
                  {Object.entries(VIOLATION_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
                
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={v.description}
                    onChange={(e) => updateViolation(dayIndex, vIndex, 'description', e.target.value)}
                    placeholder="Mô tả chi tiết (ví dụ: Lê Văn A, Phòng 202...)"
                    className="flex-grow bg-white border border-gray-200 px-2 py-1 text-[11px] outline-none focus:border-green-600"
                  />
                  <input 
                    type="number" 
                    min="1"
                    value={v.count}
                    onChange={(e) => updateViolation(dayIndex, vIndex, 'count', parseInt(e.target.value) || 1)}
                    className="w-10 bg-white border border-gray-200 px-1 py-1 text-[11px] text-center font-mono outline-none"
                  />
                </div>
              </div>
            ))}
            
            {record.violations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 opacity-20 grayscale">
                <Info size={32} />
                <p className="text-[10px] uppercase tracking-tighter mt-2 font-bold">Không có vi phạm</p>
              </div>
            )}
          </div>

          <button 
            onClick={() => addViolation(dayIndex)}
            className="mt-4 w-full py-2 border border-dashed border-gray-300 text-gray-400 hover:border-green-600 hover:text-green-600 transition-all text-xs font-mono flex items-center justify-center gap-1"
          >
            <Plus size={14} /> Thêm vi phạm
          </button>
        </div>
      ))}
    </div>
  );
};
