import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Key, Cpu, AlertCircle, ExternalLink } from 'lucide-react';
import { getApiKey, saveApiKey, getSelectedModel, saveSelectedModel } from '../lib/gemini';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MODELS = [
  { id: "gemini-3-flash-preview", name: "Gemini 3 Flash", desc: "Nhanh, hiệu suất cao (Mặc định)" },
  { id: "gemini-3-pro-preview", name: "Gemini 3 Pro", desc: "Thông minh, xử lý phức tạp" },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", desc: "Model dự phòng ổn định" },
];

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState(getApiKey());
  const [selectedModel, setSelectedModel] = useState(getSelectedModel());

  const handleSave = () => {
    saveApiKey(apiKey);
    saveSelectedModel(selectedModel);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white border-2 border-[#141414] w-full max-w-md shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#141414] text-[#E4E3E0] p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Cpu size={18} />
                <h3 className="font-mono text-xs uppercase tracking-widest font-bold">Cấu hình AI System</h3>
              </div>
              <button onClick={onClose} className="hover:rotate-90 transition-transform">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* API Key Section */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-mono uppercase font-bold text-gray-500">Google Gemini API Key</label>
                  <a 
                    href="https://aistudio.google.com/api-keys" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[10px] font-mono text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Lấy key tại đây <ExternalLink size={10} />
                  </a>
                </div>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Nhập API Key của bạn..."
                    className="w-full pl-10 pr-4 py-3 bg-[#F5F5F3] border border-[#141414] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#141414]/10"
                  />
                </div>
                {!apiKey && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle size={14} />
                    <p className="text-[10px] font-bold uppercase italic">Bắt buộc nhập API Key để sử dụng app</p>
                  </div>
                )}
              </div>

              {/* Model selection */}
              <div className="space-y-3">
                <label className="text-[10px] font-mono uppercase font-bold text-gray-500">Ưu tiên Model AI</label>
                <div className="grid grid-cols-1 gap-2">
                  {MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedModel(m.id)}
                      className={`p-3 text-left border transition-all ${
                        selectedModel === m.id 
                          ? 'border-[#141414] bg-[#F5F5F3] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]' 
                          : 'border-gray-200 hover:border-gray-400 opacity-60'
                      }`}
                    >
                      <div className="font-serif italic font-bold text-sm">{m.name}</div>
                      <div className="text-[10px] font-mono text-gray-500">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button 
                onClick={onClose}
                className="px-6 py-2 font-mono text-xs uppercase tracking-widest hover:underline"
              >
                Hủy
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2 bg-[#141414] text-[#E4E3E0] font-mono text-xs uppercase tracking-widest hover:bg-[#333] transition-colors"
              >
                Lưu cài đặt
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
