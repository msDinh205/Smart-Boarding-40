import React from 'react';
import { Settings, LogOut, User as UserIcon } from 'lucide-react';
import { User } from 'firebase/auth';
import { ClassName, CLASSES } from '../../types';
import { cn } from '../../lib/utils';

interface HeaderProps {
  user: User;
  logout: () => void;
  selectedClass: ClassName;
  setSelectedClass: (cls: ClassName) => void;
  selectedWeek: number;
  setSelectedWeek: (week: number) => void;
  roomCount: number;
  setRoomCount: (count: number) => void;
  activeTab: 'input' | 'result';
  setActiveTab: (tab: 'input' | 'result') => void;
  onOpenSettings: () => void;
  hasApiKey: boolean;
}

export default function Header({ 
  user, 
  logout, 
  selectedClass, 
  setSelectedClass, 
  selectedWeek, 
  setSelectedWeek,
  roomCount,
  setRoomCount,
  activeTab, 
  setActiveTab,
  onOpenSettings,
  hasApiKey
}: HeaderProps) {
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
          
          <div className="flex items-center gap-2 border border-green-600 bg-green-800 px-3 py-2 transition-colors focus-within:border-green-400 rounded-sm" title="Số lượng phòng nội trú của lớp này">
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
          <button 
            onClick={() => setActiveTab('input')}
            className={cn(
              "px-4 py-1.5 text-xs font-mono uppercase tracking-tighter transition-all rounded-sm",
              activeTab === 'input' ? "bg-green-600 text-white font-bold shadow-md" : "text-green-200/70 hover:text-white hover:bg-green-700"
            )}
          >
            Nhập liệu
          </button>
          <button 
            onClick={() => setActiveTab('result')}
            className={cn(
              "px-4 py-1.5 text-xs font-mono uppercase tracking-tighter transition-all rounded-sm",
              activeTab === 'result' ? "bg-green-600 text-white font-bold shadow-md" : "text-green-200/70 hover:text-white hover:bg-green-700"
            )}
          >
            Kết quả
          </button>
        </div>
        
        <div className="flex items-center gap-3 ml-2 pl-4 border-l border-green-600">
          <button 
            onClick={onOpenSettings}
            className="relative p-2 text-green-200 hover:text-white transition-colors group"
            title="Cấu hình AI"
          >
            <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
            {!hasApiKey && (
              <>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="absolute top-10 right-0 whitespace-nowrap bg-red-600 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg">LẤY API KEY ĐỂ SỬ DỤNG</span>
              </>
            )}
          </button>

          <div className="hidden md:block text-right">
            <p className="text-xs font-bold text-white leading-tight">{user.displayName || 'Giáo viên'}</p>
            <p className="text-[10px] text-green-200 font-mono">{user.email}</p>
          </div>
          {user.photoURL ? (
            <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-green-400" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-green-800 border border-green-400 flex items-center justify-center text-xs font-bold">
              <UserIcon size={14} />
            </div>
          )}
          <button 
            onClick={logout}
            className="text-green-200 hover:text-white transition-colors p-1"
            title="Đăng xuất"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
