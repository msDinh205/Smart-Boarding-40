import React from 'react';
import { Sparkles } from 'lucide-react';
import { ClassName, CLASSES } from '../../types';
import { cn } from '../../lib/utils';

interface HeaderProps {
  selectedClass: ClassName;
  setSelectedClass: (c: ClassName) => void;
  selectedWeek: number;
  setSelectedWeek: (w: number) => void;
  roomCount: number;
  setRoomCount: (n: number) => void;
  studentCount: number;
  setStudentCount: (n: number) => void;
  activeTab: 'input' | 'result' | 'ranking';
  setActiveTab: (t: 'input' | 'result' | 'ranking') => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedClass, setSelectedClass,
  selectedWeek, setSelectedWeek,
  roomCount, setRoomCount,
  studentCount, setStudentCount,
  activeTab, setActiveTab,
  onLogout,
  onOpenSettings,
  hasApiKey
}) => {
  return (
    <header className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center bg-green-700 text-white sticky top-0 z-20 gap-4 print:hidden shadow-xl border-b-4 border-green-900">
      <div>
        <h1 className="text-2xl font-serif italic font-bold tracking-tight text-white flex items-center gap-3">
          Smart Boarding
          <span className="bg-green-900 text-green-100 px-2 py-0.5 rounded-sm text-sm not-italic font-mono uppercase tracking-widest shadow-lg shadow-green-900/50">v4.0</span>
        </h1>
        <p className="text-[11px] uppercase tracking-widest text-green-100 font-mono mt-1">Giải pháp Số hóa Nề nếp và Học tập</p>
      </div>
      
      <div className="flex flex-wrap items-center gap-4">
        {!hasApiKey && (
          <button 
            onClick={onOpenSettings}
            className="text-red-400 font-bold text-xs uppercase animate-pulse border border-red-400 px-2 py-1 rounded"
          >
            Lấy API key để sử dụng app
          </button>
        )}
        
        <div className="flex items-center gap-2">
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value as ClassName)}
            className="px-3 py-2 text-sm font-mono border border-green-600 bg-green-800 text-white focus:outline-none focus:border-green-400 transition-colors rounded-sm"
          >
            {CLASSES.map(c => <option key={c} value={c}>Lớp {c}</option>)}
          </select>
          
          <select 
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
            className="px-3 py-2 text-sm font-mono border border-green-600 bg-green-800 text-white focus:outline-none focus:border-green-400 transition-colors rounded-sm"
          >
            {Array.from({length: 35}, (_, i) => i + 1).map(w => <option key={w} value={w}>Tuần {w}</option>)}
          </select>
          
          <div className="flex items-center gap-2 border border-green-600 bg-green-800 px-3 py-2 transition-colors focus-within:border-green-400 rounded-sm">
            <span className="text-sm font-mono text-green-200/70">Phòng:</span>
            <input 
              type="number" 
              min="1" 
              value={roomCount}
              onChange={(e) => setRoomCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-12 text-sm font-mono bg-transparent text-white focus:outline-none text-center"
            />
          </div>
        </div>

        <div className="flex gap-2 bg-green-800 p-1 border border-green-600 rounded-sm">
          {['input', 'result', 'ranking'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "px-4 py-1.5 text-xs font-mono uppercase tracking-tighter transition-all rounded-sm",
                activeTab === tab ? "bg-green-600 text-white font-bold shadow-md" : "text-green-200/70 hover:text-white hover:bg-green-700"
              )}
            >
              {tab === 'input' ? 'Nhập liệu' : tab === 'result' ? 'Kết quả' : 'Xếp hạng'}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3 ml-2 pl-4 border-l border-green-600">
          <button onClick={onOpenSettings} className="hover:text-green-200 transition-colors">
            <Sparkles size={18} />
          </button>
          <button 
            onClick={onLogout}
            className="text-green-200 hover:text-white transition-colors p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      </div>
    </header>
  );
};
