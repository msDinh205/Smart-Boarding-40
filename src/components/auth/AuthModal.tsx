import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, AlertCircle, ExternalLink, Key } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSave }) => {
  const [key, setKey] = useState('');
  
  useEffect(() => {
    const saved = localStorage.getItem('gemini_api_key');
    if (saved) setKey(saved);
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('gemini_api_key', key);
    onSave(key);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center">
                <Key size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Cấu hình API Key</h2>
                <p className="text-sm text-gray-500">Để sử dụng các tính năng AI thông minh</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Gemini API Key</label>
                <input 
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="Dán key của bạn vào đây..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none font-mono"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg">
                <div className="flex gap-2 text-yellow-800 mb-2">
                  <AlertCircle size={18} />
                  <span className="text-sm font-bold">Lưu ý quan trọng</span>
                </div>
                <p className="text-xs text-yellow-700 leading-relaxed">
                  Bạn cần có API Key để sử dụng tính năng "Nhập liệu bằng văn bản" và "Phân tích ảnh".
                  Key được lưu an toàn trong trình duyệt của bạn.
                </p>
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-green-700 mt-2 hover:underline"
                >
                  Lấy API key tại đây <ExternalLink size={12} />
                </a>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 px-4 py-3 rounded-lg bg-green-600 font-bold text-white hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
                >
                  Lưu cấu hình
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
