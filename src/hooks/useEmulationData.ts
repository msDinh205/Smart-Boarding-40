import { useState, useEffect, useRef, useMemo } from 'react';
import { WeeklyData, ClassName, CLASSES } from '../types';
import { calculateResultsForData } from '../lib/calculations';

export const getInitialData = (): WeeklyData => ({
  dailyRecords: ['Thứ 6', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5'].map(day => ({ 
    day, 
    violations: [], 
    baseScore: 10, 
    studentCount: 0 
  })),
  weekendViolations: { saturday: false, sunday: false },
  goodGradesCount: 0,
  classLogScore: 10,
  roomCount: 1,
  studentCount: 0,
});

export function useEmulationData() {
  const [appData, setAppData] = useState<Record<ClassName, Record<number, WeeklyData>>>(() => {
    const saved = localStorage.getItem('emulationAppData');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {} as Record<ClassName, Record<number, WeeklyData>>;
  });
  
  const [selectedClass, setSelectedClass] = useState<ClassName>('6A');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [data, setData] = useState<WeeklyData>(getInitialData());

  const appDataRef = useRef(appData);
  useEffect(() => {
    appDataRef.current = appData;
  }, [appData]);

  useEffect(() => {
    const classData = appDataRef.current[selectedClass] || {};
    let weekData = classData[selectedWeek];
    
    if (!weekData) {
      weekData = getInitialData();
      const existingWeeks = Object.keys(classData).map(Number).sort((a, b) => b - a);
      if (existingWeeks.length > 0) {
        weekData.roomCount = classData[existingWeeks[0]].roomCount || 1;
      }
    }
    setData(weekData);
  }, [selectedClass, selectedWeek]);

  useEffect(() => {
    setAppData(prev => {
      const newAppData = { ...prev };
      if (!newAppData[selectedClass]) newAppData[selectedClass] = {};
      newAppData[selectedClass][selectedWeek] = data;
      localStorage.setItem('emulationAppData', JSON.stringify(newAppData));
      return newAppData;
    });
  }, [data, selectedClass, selectedWeek]);

  const results = useMemo(() => calculateResultsForData(data), [data]);

  const rankingData = useMemo(() => {
    const scores: { name: ClassName, score: number, level: 'THCS' | 'THPT' }[] = [];
    
    CLASSES.forEach(className => {
      const classData = appData[className];
      if (classData) {
        const weeks = Object.keys(classData).map(Number);
        if (weeks.length > 0) {
          const latestWeek = Math.max(...weeks);
          const data = classData[latestWeek];
          const { S } = calculateResultsForData(data);
          const level = (className.startsWith('10') || className.startsWith('11') || className.startsWith('12')) ? 'THPT' : 'THCS';
          scores.push({ name: className, score: S, level });
        }
      }
    });

    const thcs = scores.filter(s => s.level === 'THCS').sort((a, b) => b.score - a.score);
    const thpt = scores.filter(s => s.level === 'THPT').sort((a, b) => b.score - a.score);
    const bottomThcs = [...thcs].reverse().slice(0, 3);
    const bottomThpt = [...thpt].reverse().slice(0, 2);
    
    return { thcs, thpt, bottomThcs, bottomThpt };
  }, [appData]);

  return {
    appData,
    selectedClass,
    setSelectedClass,
    selectedWeek,
    setSelectedWeek,
    data,
    setData,
    results,
    rankingData
  };
}
