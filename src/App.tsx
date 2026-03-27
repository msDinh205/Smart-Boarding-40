/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Calculator } from 'lucide-react';
import { auth, loginWithGoogle, logout, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getDocFromServer, doc } from 'firebase/firestore';
import { ClassName, WeeklyData, Violation } from './types';

// Components
import Header from './components/layout/Header';
import SettingsModal from './components/ui/SettingsModal';
import InputSection from './components/emulation/InputSection';
import ResultSection from './components/emulation/ResultSection';

// Lib
import { getApiKey, generateWithFallback } from './lib/gemini';
import { 
  getInitialData, 
  calculateResultsForData, 
  getComparativeAnalysis, 
  generateMarkdownReport 
} from './lib/emulation';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Application Data State
  const [appData, setAppData] = useState<Record<ClassName, Record<number, WeeklyData>>>(() => {
    const saved = localStorage.getItem('emulationAppData');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {} as Record<ClassName, Record<number, WeeklyData>>;
  });
  
  const appDataRef = useRef(appData);
  useEffect(() => {
    appDataRef.current = appData;
  }, [appData]);

  const [selectedClass, setSelectedClass] = useState<ClassName>('6A');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [data, setData] = useState<WeeklyData>(() => getInitialData());
  
  const [activeTab, setActiveTab] = useState<'input' | 'result'>('input');
  const [rawInput, setRawInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [showMarkdown, setShowMarkdown] = useState(false);

  // Load Data on Class/Week change
  useEffect(() => {
    const classData = appDataRef.current[selectedClass] || {};
    let weekData = classData[selectedWeek];
    
    if (!weekData) {
      // Inherit roomCount from previous week if available
      const existingWeeks = Object.keys(classData).map(Number).sort((a, b) => b - a);
      const prevRoomCount = existingWeeks.length > 0 ? classData[existingWeeks[0]].roomCount : 1;
      weekData = getInitialData(prevRoomCount);
    }
    setData(weekData);
  }, [selectedClass, selectedWeek]);

  // Save Data
  useEffect(() => {
    setAppData(prev => {
      const newAppData = { ...prev };
      if (!newAppData[selectedClass]) newAppData[selectedClass] = {};
      newAppData[selectedClass][selectedWeek] = data;
      localStorage.setItem('emulationAppData', JSON.stringify(newAppData));
      return newAppData;
    });
  }, [data, selectedClass, selectedWeek]);

  // Derived Values
  const calculateResults = useMemo(() => calculateResultsForData(data), [data]);
  
  const comparativeAnalysis = useMemo(() => 
    getComparativeAnalysis(appData, selectedClass, selectedWeek, data, calculateResults.S),
    [appData, selectedClass, selectedWeek, data, calculateResults.S]
  );

  // Handlers
  const handleProcessRawData = async () => {
    if (!rawInput.trim()) return;
    setIsProcessing(true);
    try {
      const prompt = `
        Bạn là trợ lý trích xuất dữ liệu thi đua. 
        Dựa trên văn bản thô sau, hãy trích xuất các thông tin cần thiết để điền vào cấu trúc dữ liệu.
        
        Văn bản: "${rawInput}"
        
        Quy tắc trích xuất:
        1. Tìm lỗi vi phạm cho 5 ngày: Thứ 6, Thứ 2, Thứ 3, Thứ 4, Thứ 5.
        2. Các loại lỗi: classroom (lớp học/tự học), room (phòng ở), dining (bàn ăn), hygiene2 (vệ sinh -2), hygiene3 (vệ sinh -3), heavy5 (thuốc lá/đt), heavy10 (đánh bài/gây gổ).
        3. Tìm số lượng điểm 9, 10 trong tuần.
        4. Tìm điểm sổ đầu bài.
        5. Tìm vi phạm Thứ 7, Chủ nhật.
        
        Trả về JSON theo định dạng sau:
        {
          "dailyRecords": [
            { "day": "Thứ 6", "violations": [{ "type": "room", "description": "string", "count": 1 }] },
            ... (đủ 5 ngày theo thứ tự: Thứ 6, Thứ 2, Thứ 3, Thứ 4, Thứ 5)
          ],
          "weekendViolations": { "saturday": boolean, "sunday": boolean },
          "goodGradesCount": number,
          "classLogScore": number,
          "roomCount": number
        }
      `;
      
      const responseText = await generateWithFallback(prompt, { responseMimeType: "application/json" });
      const result = JSON.parse(responseText);
      
      setData(prev => ({
        ...prev,
        ...result,
        dailyRecords: result.dailyRecords.map((r: any) => ({ ...r, baseScore: 10 }))
      }));
      setActiveTab('result');
      generateAiAnalysis(result);
    } catch (error) {
      console.error("Error processing data:", error);
      alert(error instanceof Error ? error.message : "Có lỗi xảy ra khi xử lý dữ hiệu.");
    } finally {
      setIsProcessing(false);
    }
  };

  const generateAiAnalysis = async (currentData: WeeklyData) => {
    setIsAiGenerating(true);
    setAiAnalysis(null);
    try {
      const results = calculateResultsForData(currentData);
      const prompt = `
        Bạn là một Cố vấn Giáo dục (AI Counselor). 
        Dựa trên dữ liệu thi đua sau của lớp ${selectedClass} Tuần ${selectedWeek}, hãy đưa ra nhận xét sâu sắc và giải pháp giáo dục phù hợp.
        
        Dữ liệu: ${JSON.stringify(currentData)}
        Tính toán: N=${results.N}, T=${results.T}, S=${results.S}
        
        Yêu cầu:
        1. Nhận xét ưu/nhược điểm (ngắn gọn, chân thành).
        2. Đề xuất 1 giải pháp cụ thể để cải thiện nề nếp dựa trên vi phạm phổ biến nhất.
        3. Văn phong: Chuyên nghiệp, khích lệ.
        4. Ngôn ngữ: Tiếng Việt. Format: Markdown.
      `;
      const responseText = await generateWithFallback(prompt);
      setAiAnalysis(responseText);
    } catch (e) {
      console.error(e);
      setAiAnalysis("Không thể tạo nhận xét lúc này. Vui lòng kiểm tra API Key.");
    } finally {
      setIsAiGenerating(false);
    }
  };

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

  const [authError, setAuthError] = useState<string | null>(null);

  const handleLogin = async () => {
    setAuthError(null);
    try {
      await loginWithGoogle();
    } catch (e: any) {
      setAuthError(e.message || "Đã xảy ra lỗi khi đăng nhập.");
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center font-sans">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-mono opacity-50 uppercase tracking-widest">Đang khởi động...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#064e3b] flex items-center justify-center font-sans p-4 overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-3xl shadow-2xl max-w-lg w-full text-center relative z-10 border border-white/20"
        >
          <div className="w-24 h-24 bg-[#f0fdf4] text-[#059669] rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-sm border border-[#d1fae5]">
             <Calculator size={48} />
          </div>
          
          <h1 className="text-5xl font-serif text-[#1e293b] font-medium mb-4 tracking-tight">Bảng thông minh</h1>
          <p className="text-xs uppercase tracking-[0.4em] text-[#64748b] font-sans font-semibold mb-12">Giải pháp số hóa nề nếp</p>
          
          <div className="space-y-4">
            <button 
              onClick={handleLogin}
              className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold py-5 px-8 rounded-2xl transition-all flex items-center justify-center gap-4 shadow-[0_12px_24px_-8px_rgba(16,185,129,0.5)] active:scale-[0.98] group"
            >
              <div className="bg-white p-1 rounded-full group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <span className="text-lg">Bắt đầu với Tài khoản Google</span>
            </button>
            
            {authError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium border border-red-100"
              >
                {authError}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0] print:bg-white">
      <Header 
        user={user}
        logout={logout}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        selectedWeek={selectedWeek}
        setSelectedWeek={setSelectedWeek}
        roomCount={data.roomCount}
        setRoomCount={(count) => setData({...data, roomCount: count})}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasApiKey={!!getApiKey()}
      />

      <main className="max-w-6xl mx-auto p-6 md:p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'input' ? (
            <InputSection 
              rawInput={rawInput}
              setRawInput={setRawInput}
              isProcessing={isProcessing}
              onProcessRawData={handleProcessRawData}
              data={data}
              setData={setData}
              addViolation={addViolation}
              removeViolation={removeViolation}
              updateViolation={updateViolation}
              onViewResults={() => {
                setActiveTab('result');
                generateAiAnalysis(data);
              }}
            />
          ) : (
            <ResultSection 
              selectedClass={selectedClass}
              selectedWeek={selectedWeek}
              data={data}
              results={calculateResults}
              comparativeAnalysis={comparativeAnalysis}
              aiAnalysis={aiAnalysis}
              isAiGenerating={isAiGenerating}
              onEditData={() => setActiveTab('input')}
              onShowMarkdown={() => setShowMarkdown(true)}
            />
          )}
        </AnimatePresence>

        {/* Markdown Export Modal */}
        <AnimatePresence>
          {showMarkdown && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white border-2 border-[#141414] w-full max-w-2xl shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] flex flex-col max-h-[90vh]"
              >
                <div className="flex justify-between items-center p-4 border-b border-[#141414] bg-[#141414] text-[#E4E3E0]">
                  <h3 className="font-mono text-xs uppercase tracking-widest font-bold">Xuất dữ liệu Markdown</h3>
                  <button onClick={() => setShowMarkdown(false)} className="hover:rotate-90 transition-transform">✕</button>
                </div>
                <div className="p-6 flex-1 overflow-auto">
                  <textarea 
                    readOnly
                    value={generateMarkdownReport(data, calculateResults, selectedClass, selectedWeek)}
                    className="w-full h-80 p-4 bg-[#F5F5F3] border border-[#141414] font-mono text-xs focus:outline-none resize-none leading-relaxed"
                  />
                </div>
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(generateMarkdownReport(data, calculateResults, selectedClass, selectedWeek));
                      alert('Đã copy vào clipboard!');
                    }}
                    className="px-6 py-2 bg-[#141414] text-[#E4E3E0] font-mono text-xs uppercase tracking-widest hover:bg-[#333] transition-colors"
                  >
                    Copy Markdown
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      </main>

      <footer className="mt-20 border-t border-[#141414]/10 p-12 text-center opacity-40 print:mt-8 print:p-4">
        <p className="font-mono text-[9px] uppercase tracking-[0.4em]">Smart Boarding v4.0 • Digital Transformation in Education • 2026</p>
      </footer>
    </div>
  );
}
