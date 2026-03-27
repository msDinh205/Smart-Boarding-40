import { WeeklyData, VIOLATION_POINTS, VIOLATION_LABELS, ClassName } from '../types';

export const getInitialData = (roomCount: number = 1): WeeklyData => ({
  dailyRecords: ['Thứ 6', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5'].map(day => ({ 
    day, 
    violations: [], 
    baseScore: 10 
  })),
  weekendViolations: { saturday: false, sunday: false },
  goodGradesCount: 0,
  classLogScore: 10,
  roomCount: roomCount,
});

export const calculateResultsForData = (data: WeeklyData) => {
  if (!data) return { N: 0, T: 0, weekendDeduction: 0, S: 0, dailyScores: [0,0,0,0,0] };
  const roomCount = Math.max(1, data.roomCount || 1);

  const dailyScores = data.dailyRecords.map(record => {
    let roomDeduction = 0;
    let otherDeduction = 0;
    
    record.violations.forEach(v => {
      const points = VIOLATION_POINTS[v.type] * v.count;
      if (v.type === 'room') {
        roomDeduction += points;
      } else {
        otherDeduction += points;
      }
    });
    
    const effectiveRoomDeduction = roomDeduction / roomCount;
    const totalDeduction = otherDeduction + effectiveRoomDeduction;
    
    return Math.max(0, record.baseScore - totalDeduction);
  });
  const N = dailyScores.reduce((sum, s) => sum + s, 0) / 5;

  let T = 0;
  const g = data.goodGradesCount;
  if (g >= 1 && g <= 5) T = 2;
  else if (g >= 6 && g <= 10) T = 4;
  else if (g >= 11 && g <= 15) T = 6;
  else if (g >= 16 && g <= 20) T = 8;
  else if (g > 20) T = 10;

  const weekendDeduction = (data.weekendViolations.saturday ? 2 : 0) + (data.weekendViolations.sunday ? 2 : 0);
  const S = (0.45 * N) + (0.45 * data.classLogScore) + (0.1 * T) - weekendDeduction;

  return { N, T, weekendDeduction, S: Math.round(S * 100) / 100, dailyScores };
};

export const getComparativeAnalysis = (appData: Record<ClassName, Record<number, WeeklyData>>, selectedClass: ClassName, selectedWeek: number, currentData: WeeklyData, currentS: number) => {
  const classData = appData[selectedClass] || {};
  const w1Data = classData[selectedWeek - 1];
  const w2Data = classData[selectedWeek - 2];

  let growth = null;
  let w1Score = null;
  if (w1Data) {
    const w1Results = calculateResultsForData(w1Data);
    w1Score = w1Results.S;
    if (w1Score > 0) {
      growth = ((currentS - w1Score) / w1Score) * 100;
    }
  }

  const weeksToAnalyze = [currentData, w1Data, w2Data].filter(Boolean) as WeeklyData[];
  const violationCounts: Record<string, number> = {};
  
  weeksToAnalyze.forEach(w => {
    w.dailyRecords.forEach(r => {
      r.violations.forEach(v => {
        violationCounts[v.type] = (violationCounts[v.type] || 0) + v.count;
      });
    });
  });

  let mostFrequentViolationType = null;
  let mostFrequentViolation = null;
  let maxCount = 0;
  Object.entries(violationCounts).forEach(([type, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostFrequentViolationType = type;
      mostFrequentViolation = VIOLATION_LABELS[type as keyof typeof VIOLATION_LABELS];
    }
  });

  return { w1Score, growth, mostFrequentViolation, mostFrequentViolationType, maxCount };
};

export const generateMarkdownReport = (data: WeeklyData, results: any, selectedClass: string, selectedWeek: number) => {
  let md = `### Bảng Điểm Thi Đua Tuần ${selectedWeek} - Lớp ${selectedClass}\n\n`;
  md += `| Hạng mục | Chi tiết | Điểm |\n`;
  md += `| :--- | :--- | :--- |\n`;
  
  data.dailyRecords.forEach((r, i) => {
    const details = r.violations.length > 0 
      ? r.violations.map(v => {
          let text = `${VIOLATION_LABELS[v.type]} x${v.count}`;
          if (v.type === 'room' && (data.roomCount || 1) > 1) {
            text += ` (chia ${data.roomCount} phòng)`;
          }
          return text;
        }).join(', ')
      : "Không vi phạm";
    md += `| **${r.day}** | ${details} | ${results.dailyScores[i].toFixed(2)} |\n`;
  });

  md += `| **Điểm nề nếp trung bình (N)** | (Tổng 5 ngày) / 5 | **${results.N.toFixed(2)}** |\n`;
  md += `| **Điểm Sổ đầu bài** | Dữ liệu từ giáo viên | ${data.classLogScore.toFixed(1)} |\n`;
  md += `| **Điểm thưởng (T)** | ${data.goodGradesCount} điểm 9, 10 | +${results.T} |\n`;
  
  let weekendStr = "Không vi phạm";
  if (data.weekendViolations.saturday || data.weekendViolations.sunday) {
    weekendStr = [
      data.weekendViolations.saturday ? "Thứ 7 (-2)" : "",
      data.weekendViolations.sunday ? "Chủ nhật (-2)" : ""
    ].filter(Boolean).join(", ");
  }
  md += `| **Trừ cuối tuần** | ${weekendStr} | -${results.weekendDeduction} |\n`;
  md += `| **TỔNG ĐIỂM (S)** | (0.45*N) + (0.45*SĐB) + (0.1*T) - L | **${results.S.toFixed(2)}** |\n`;

  return md;
};

export const exportToWord = (data: WeeklyData, results: any, selectedClass: string, selectedWeek: number, aiAnalysis: string | null) => {
  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Báo Cáo Thi Đua</title></head>
    <body style="font-family: 'Times New Roman', Times, serif;">
      <h1 style="text-align: center;">BÁO CÁO THI ĐUA NỀ NẾP & HỌC TẬP</h1>
      <p style="text-align: center; font-weight: bold;">Lớp: ${selectedClass} - Tuần: ${selectedWeek}</p>
      <hr/>
      
      <h2>1. Kết quả tổng hợp</h2>
      <table border="1" cellspacing="0" cellpadding="5" style="width: 100%; border-collapse: collapse;">
        <tr><td>Điểm nề nếp (N)</td><td>${results.N.toFixed(2)}</td></tr>
        <tr><td>Điểm Sổ đầu bài</td><td>${data.classLogScore.toFixed(1)}</td></tr>
        <tr><td>Điểm thưởng (T)</td><td>+${results.T}</td></tr>
        <tr><td>Trừ cuối tuần</td><td>-${results.weekendDeduction}</td></tr>
        <tr style="background-color: #f0f0f0; font-weight: bold;">
          <td>TỔNG ĐIỂM (S)</td>
          <td>${results.S.toFixed(2)}</td>
        </tr>
      </table>

      <h2>2. Chi tiết theo ngày</h2>
      <table border="1" cellspacing="0" cellpadding="5" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f0f0f0;">
            <th>Thứ</th>
            <th>Vi phạm</th>
            <th>Điểm</th>
          </tr>
        </thead>
        <tbody>
          ${data.dailyRecords.map((r, i) => `
            <tr>
              <td>${r.day}</td>
              <td>${r.violations.length > 0 ? r.violations.map(v => `${VIOLATION_LABELS[v.type]} x${v.count}`).join(', ') : 'Không vi phạm'}</td>
              <td style="text-align: right;">${results.dailyScores[i].toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2>3. Nhận xét từ Trợ lý AI</h2>
      <div style="background-color: #f9f9f9; padding: 10px; border: 1px solid #ddd;">
        ${aiAnalysis ? aiAnalysis.replace(/\n/g, '<br/>') : 'Chưa có nhận xét.'}
      </div>

      <p style="margin-top: 50px; text-align: right;"><i>Ngày xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')}</i></p>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', content], {
    type: 'application/msword'
  });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Bao_cao_Thi_dua_T${selectedWeek}_Lop_${selectedClass}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
