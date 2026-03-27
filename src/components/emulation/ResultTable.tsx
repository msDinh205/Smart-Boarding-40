import React from 'react';
import { FileText } from 'lucide-react';
import { DailyRecord, VIOLATION_LABELS } from '../../types';

interface ResultTableProps {
  dailyRecords: DailyRecord[];
  roomCount: number;
  dailyScores: number[];
  N: number;
  classLogScore: number;
  T: number;
  weekendDeduction: number;
  S: number;
}

export default function ResultTable({
  dailyRecords,
  roomCount,
  dailyScores,
  N,
  classLogScore,
  T,
  weekendDeduction,
  S
}: ResultTableProps) {
  return (
    <section className="bg-white border border-[#141414] overflow-hidden">
      <div className="bg-[#141414] text-[#E4E3E0] px-6 py-3 flex items-center gap-2">
        <FileText className="w-4 h-4" />
        <h2 className="font-mono text-xs uppercase tracking-widest">Bảng tính chi tiết</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#141414]">
              <th className="p-4 font-serif italic text-xs uppercase opacity-50">Hạng mục</th>
              <th className="p-4 font-serif italic text-xs uppercase opacity-50">Chi tiết</th>
              <th className="p-4 font-serif italic text-xs uppercase opacity-50 text-right">Điểm</th>
            </tr>
          </thead>
          <tbody className="font-mono text-xs">
            {dailyRecords.map((r, i) => (
              <tr key={r.day} className="border-b border-[#141414]/10 hover:bg-gray-50 transition-colors">
                <td className="p-4 font-bold">{r.day}</td>
                <td className="p-4">
                  {r.violations.length > 0 
                    ? r.violations.map(v => {
                        let text = `${VIOLATION_LABELS[v.type]} x${v.count}`;
                        if (v.type === 'room' && (roomCount || 1) > 1) {
                          text += ` (chia ${roomCount} phòng)`;
                        }
                        return text;
                      }).join(', ')
                    : "Không vi phạm"}
                </td>
                <td className="p-4 text-right">{dailyScores[i].toFixed(2)}</td>
              </tr>
            ))}
            <tr className="bg-[#F5F5F3]">
              <td className="p-4 font-bold">Điểm nề nếp trung bình (N)</td>
              <td className="p-4 italic opacity-60">(Tổng 5 ngày) / 5</td>
              <td className="p-4 text-right font-bold">{N.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="p-4 font-bold">Điểm Sổ đầu bài</td>
              <td className="p-4">Dữ liệu từ giáo viên</td>
              <td className="p-4 text-right">{classLogScore.toFixed(1)}</td>
            </tr>
            <tr>
              <td className="p-4 font-bold">Điểm thưởng (T)</td>
              <td className="p-4">Học tập & Phong trào</td>
              <td className="p-4 text-right">+{T}</td>
            </tr>
            <tr>
              <td className="p-4 font-bold">Trừ cuối tuần</td>
              <td className="p-4">Vi phạm Thứ 7/Chủ nhật</td>
              <td className="p-4 text-right text-red-600">-{weekendDeduction}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="bg-[#141414] text-[#E4E3E0]">
              <td colSpan={2} className="p-4 font-serif italic text-lg">Công thức: (0.45*N) + (0.45*SĐB) + (0.1*T) - L</td>
              <td className="p-4 text-right text-2xl font-serif italic font-bold">{S.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
