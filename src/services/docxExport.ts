import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, WidthType, BorderStyle } from "docx";
import { saveAs } from "file-saver";
import { WeeklyData, ClassName, VIOLATION_LABELS } from "../types";

export const exportToDocx = async (data: WeeklyData, results: any, className: ClassName, week: number) => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `BÁO CÁO THI ĐUA TUẦN ${week}`,
                bold: true,
                size: 32,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `LỚP: ${className}`,
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Ngày", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "Vi phạm", bold: true })] }),
                  new TableCell({ children: [new Paragraph({ text: "Điểm", bold: true })] }),
                ],
              }),
              ...data.dailyRecords.map((r, i) => new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(r.day)] }),
                  new TableCell({ 
                    children: [
                      new Paragraph(
                        r.violations.length > 0 
                          ? r.violations.map(v => `${VIOLATION_LABELS[v.type]} (x${v.count})`).join(", ")
                          : "Không vi phạm"
                      )
                    ] 
                  }),
                  new TableCell({ children: [new Paragraph(results.dailyScores[i].toFixed(2))] }),
                ],
              })),
            ],
          }),

          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: "TỔNG KẾT TUẦN:", bold: true }),
            ],
          }),
          new Paragraph({ text: `- Điểm Nề nếp (N): ${results.N.toFixed(2)}` }),
          new Paragraph({ text: `- Điểm Sổ đầu bài: ${data.classLogScore.toFixed(1)}` }),
          new Paragraph({ text: `- Điểm Thưởng (T): +${results.T}` }),
          new Paragraph({ text: `- Điểm Trừ Cuối Tuần: -${results.weekendDeduction}` }),
          new Paragraph({
            children: [
              new TextRun({ text: `- TỔNG ĐIỂM (S): ${results.S.toFixed(2)}`, bold: true, color: "FF0000" }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Bao_cao_Tuan_${week}_Lop_${className}.docx`);
};
