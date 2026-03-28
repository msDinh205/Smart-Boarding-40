import { WeeklyData, VIOLATION_POINTS } from "../types";

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
