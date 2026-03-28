import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ShieldAlert, Sparkles, Trophy } from 'lucide-react';

interface ClassAvatarProps {
  score: number;
  studentCount: number;
}

export const ClassAvatar: React.FC<ClassAvatarProps> = ({ score, studentCount }) => {
  const getStatus = () => {
    if (score >= 9.5) return { label: 'Xuất sắc', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Trophy, face: '◕‿◕' };
    if (score >= 8.5) return { label: 'Tốt', color: 'text-green-600', bg: 'bg-green-50', icon: Sparkles, face: '^▽^' };
    if (score >= 7.0) return { label: 'Khá', color: 'text-blue-600', bg: 'bg-blue-50', icon: ShieldCheck, face: '•‿•' };
    return { label: 'Cần cố gắng', color: 'text-red-600', bg: 'bg-red-50', icon: ShieldAlert, face: '•︿•' };
  };

  const status = getStatus();

  return (
    <div className={`flex items-center gap-6 p-6 border-2 border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] ${status.bg}`}>
      <div className="relative">
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 bg-green-700 rounded-full flex flex-col items-center justify-center text-white relative shadow-inner"
        >
          <div className="text-2xl font-bold font-mono transition-all duration-500">{status.face}</div>
          <div className="absolute -bottom-2 flex gap-1">
            {[1, 2, 3, 4].map(i => (
              <motion.div 
                key={i}
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                className="w-3 h-6 bg-green-800 rounded-full origin-top"
              />
            ))}
          </div>
        </motion.div>
        <div className="absolute -top-2 -right-2 bg-white border border-[#141414] rounded-full p-1.5 shadow-sm">
          <status.icon size={16} className={status.color} />
        </div>
      </div>

      <div className="flex-grow">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-serif italic font-bold">Linh vật Nề nếp</h2>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border border-current ${status.color}`}>
            {status.label}
          </span>
        </div>
        <p className="text-sm text-gray-600 leading-tight">
          Bạch tuộc đang cảm thấy <span className={`font-bold ${status.color}`}>{status.label.toLowerCase()}</span> dựa trên điểm số <span className="font-mono font-bold text-[#141414]">{score.toFixed(2)}</span> của lớp.
        </p>
        <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden border border-[#141414]">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(score / 10) * 100}%` }}
            className={`h-full ${score >= 8.5 ? 'bg-green-600' : score >= 7.0 ? 'bg-blue-600' : 'bg-red-600'}`}
          />
        </div>
      </div>

      <div className="hidden md:block text-right border-l border-[#141414]/10 pl-6">
        <div className="text-[10px] uppercase font-mono font-bold text-gray-400">Sĩ số lớp</div>
        <div className="text-2xl font-serif italic font-bold">{studentCount}</div>
        <div className="text-[10px] text-gray-400 font-mono">Học sinh</div>
      </div>
    </div>
  );
};
