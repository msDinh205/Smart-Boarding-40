import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Download, FileText, Camera, CheckCircle2 } from 'lucide-react';

// Hooks & Services
import { useEmulationData } from './hooks/useEmulationData';
import { AIService } from './services/aiService';
import { exportToDocx } from './services/docxExport';
import { exportToPdf } from './services/pdfExport';

// Components
import { Header } from './components/layout/Header';
import { AuthModal } from './components/auth/AuthModal';
import { QuickInput } from './components/input/QuickInput';
import { DailyInput } from './components/input/DailyInput';
import { ScoreCard } from './components/result/ScoreCard';
import { AIAnalysis } from './components/result/AIAnalysis';
import { RankingTable } from './components/ranking/RankingTable';
import { ViolationHeatmap } from './components/visualization/ViolationHeatmap';
import { ClassAvatar } from './components/gamification/ClassAvatar';

import { WeeklyData } from './types';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'input' | 'result' | 'ranking'>('input');
  
  const {
    selectedClass, setSelectedClass,
    selectedWeek, setSelectedWeek,
    data, setData,
    results,
    rankingData
  } = useEmulationData();

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [pendingAiData, setPendingAiData] = useState<Partial<WeeklyData> | null>(null);
  const [analyzingImageDay, setAnalyzingImageDay] = useState<number | null>(null);
  const [pendingImageAnalysis, setPendingImageAnalysis] = useState<{ dayIndex: number, text: string } | null>(null);
  
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem('gemini_api_key') || '');
  const aiService = useRef(new AIService(apiKey));

  useEffect(() => {
    const loginToken = localStorage.getItem('app_login_token');
    if (loginToken === 'admin123') setIsAuthenticated(true);
    setIsAuthReady(true);
  }, []);

  useEffect(() => {
    aiService.current = new AIService(apiKey);
  }, [apiKey]);

  const handleLogin = (token: string) => {
    if (token === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('app_login_token', 'admin123');
    } else {
      alert('Mã truy cập không hợp lệ!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('app_login_token');
  };

  const handleProcessRawData = async (text: string) => {
    setIsProcessingAi(true);
    try {
      const result = await aiService.current.processRawData(text);
      setPendingAiData(result);
    } catch (e) {
      alert("Lỗi phân tích: " + (e as Error).message);
    } finally {
      setIsProcessingAi(false);
    }
  };

  const handleGenerateAnalysis = async () => {
    setIsProcessingAi(true);
    setAiError(null);
    try {
      const text = await aiService.current.generateAnalysis(data, results);
      setAiAnalysis(text);
    } catch (e) {
      setAiError((e as Error).message);
    } finally {
      setIsProcessingAi(false);
    }
  };

  const handleAnalyzeImage = async (dayIndex: number) => {
    setAnalyzingImageDay(dayIndex);
    // Note: In a real app, you'd trigger a file picker here
    // For this refactor, I'll keep the logic but the file input needs to be in App or DailyInput
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const text = await aiService.current.analyzeImage(reader.result as string);
          setPendingImageAnalysis({ dayIndex, text });
        } catch (err) {
          alert("Lỗi phân tích ảnh");
        } finally {
          setAnalyzingImageDay(null);
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const contentRef = useRef<HTMLDivElement>(null);

  if (!isAuthReady) return <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center font-mono opacity-50">Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-green-900 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
          <h1 className="text-3xl font-serif italic font-bold mb-6">Smart Boarding 4.0</h1>
          <form onSubmit={(e) => { e.preventDefault(); handleLogin((e.target as any).token.value); }} className="space-y-4">
            <input name="token" type="password" placeholder="Nhập mã truy cập (admin123)" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
            <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700">Đăng nhập</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans">
      <Header 
        selectedClass={selectedClass} setSelectedClass={setSelectedClass}
        selectedWeek={selectedWeek} setSelectedWeek={setSelectedWeek}
        roomCount={data.roomCount} setRoomCount={(n) => setData({...data, roomCount: n})}
        studentCount={data.studentCount} setStudentCount={(n) => setData({...data, studentCount: n})}
        activeTab={activeTab} setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasApiKey={!!apiKey}
      />

      <main className="max-w-6xl mx-auto p-6 space-y-8" ref={contentRef}>
        <AnimatePresence mode="wait">
          {activeTab === 'input' && (
            <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              <QuickInput 
                onProcess={handleProcessRawData} 
                isProcessing={isProcessingAi} 
                pendingData={pendingAiData}
                onConfirm={() => { if (pendingAiData) setData({...data, ...pendingAiData as WeeklyData}); setPendingAiData(null); setActiveTab('result'); }}
                onCancel={() => setPendingAiData(null)}
              />
              <DailyInput 
                data={data} 
                setData={setData} 
                onAnalyzeImage={handleAnalyzeImage}
                analyzingImageDay={analyzingImageDay}
              />
              
              {/* Image Analysis Result Modal/Overlay */}
              {pendingImageAnalysis && (
                <div className="bg-blue-50 border-2 border-blue-400 p-6 rounded-lg relative">
                   <h3 className="font-bold text-blue-900 mb-2">AI Scan Result ({data.dailyRecords[pendingImageAnalysis.dayIndex].day})</h3>
                   <p className="text-sm border-l-4 border-blue-200 pl-4 italic mb-4">{pendingImageAnalysis.text}</p>
                   <button onClick={() => setPendingImageAnalysis(null)} className="w-full bg-blue-600 text-white py-2 rounded font-bold transition-colors hover:bg-blue-700">Đã đọc</button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'result' && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-grow space-y-8">
                   <ClassAvatar score={results.S} studentCount={data.studentCount} />
                   <ScoreCard results={results} data={data} />
                   <ViolationHeatmap data={data} />
                </div>
                <div className="w-full md:w-64 space-y-4 print:hidden">
                   <button 
                     onClick={() => exportToPdf(contentRef.current!, `Bao_cao_Lop_${selectedClass}_Tuan_${selectedWeek}.pdf`)}
                     className="w-full py-3 bg-white border border-[#141414] hover:bg-gray-50 flex items-center justify-center gap-2 font-mono text-xs uppercase"
                   >
                     <Download size={14} /> PDF Export
                   </button>
                   <button 
                      onClick={() => exportToDocx(data, results, selectedClass, selectedWeek)}
                      className="w-full py-3 bg-[#141414] text-white flex items-center justify-center gap-2 font-mono text-xs uppercase"
                   >
                     <FileText size={14} /> Word Export (DOCX)
                   </button>
                </div>
              </div>
              <AIAnalysis 
                analysis={aiAnalysis} 
                onGenerate={handleGenerateAnalysis} 
                isGenerating={isProcessingAi} 
                error={aiError}
              />
            </motion.div>
          )}

          {activeTab === 'ranking' && (
            <motion.div key="ranking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RankingTable rankingData={rankingData} selectedClass={selectedClass} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AuthModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onSave={(key) => setApiKey(key)}
      />
    </div>
  );
}
