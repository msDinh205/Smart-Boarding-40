import { GoogleGenAI } from "@google/genai";
import { WeeklyData } from "../types";

const MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-pro",
  "gemini-1.5-flash"
];

export class AIService {
  private genAI: GoogleGenAI | null = null;

  constructor(apiKey: string) {
    if (apiKey) {
      this.genAI = new GoogleGenAI(apiKey);
    }
  }

  private async tryGenerate(prompt: string, modelIndex: number = 0): Promise<string> {
    if (!this.genAI) throw new Error("API Key chưa được thiết lập");
    
    const modelName = MODELS[modelIndex];
    try {
      const model = this.genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.warn(`Model ${modelName} failed:`, error);
      if (modelIndex < MODELS.length - 1) {
        return this.tryGenerate(prompt, modelIndex + 1);
      }
      throw error;
    }
  }

  async processRawData(input: string): Promise<Partial<WeeklyData>> {
    const prompt = `
      Bạn là trợ lý trích xuất dữ liệu thi đua. 
      Dựa trên văn bản thô sau, hãy trích xuất các thông tin cần thiết để điền vào cấu trúc dữ liệu.
      
      Văn bản: "${input}"
      
      Quy tắc trích xuất:
      1. Tìm lỗi vi phạm cho 5 ngày: Thứ 6, Thứ 2, Thứ 3, Thứ 4, Thứ 5.
      2. Các loại lỗi: classroom (lớp học/tự học), room (phòng ở), dining (bàn ăn), hygiene2 (vệ sinh -2), hygiene3 (vệ sinh -3), heavy5 (thuốc lá/đt), heavy10 (đánh bài/gây gổ).
      3. Tìm số lượng điểm 9, 10 trong tuần.
      4. Tìm điểm sổ đầu bài.
      5. Tìm vi phạm Thứ 7, Chủ nhật.
      
      Trả về JSON theo định dạng sau:
      {
        "dailyRecords": [
          { "day": "Thứ 6", "violations": [{ "type": "room", "description": "Phòng bẩn", "count": 1 }] },
          ... (đủ 5 ngày theo thứ tự: Thứ 6, Thứ 2, Thứ 3, Thứ 4, Thứ 5)
        ],
        "weekendViolations": { "saturday": boolean, "sunday": boolean },
        "goodGradesCount": number,
        "classLogScore": number,
        "roomCount": number
      }
      
      Lưu ý: Nếu ngày nào không có lỗi, mảng violations để trống. Điểm sổ đầu bài mặc định là 10 nếu không thấy nhắc tới.
    `;

    const text = await this.tryGenerate(prompt);
    // Sanitize JSON response (sometimes Gemini wraps it in ```json ... ```)
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr);
  }

  async generateAnalysis(data: WeeklyData, results: any): Promise<string> {
    const prompt = `
      Dựa trên dữ liệu thi đua sau, hãy đưa ra nhận xét ngắn gọn (khoảng 3-4 câu) về ưu điểm và nhược điểm của lớp trong tuần này.
      Dữ liệu: ${JSON.stringify(data)}
      Kết quả tính toán: N=${results.N}, T=${results.T}, S=${results.S}
      Sĩ số lớp: ${data.studentCount}
      Hãy đưa ra lời khuyên tư vấn tâm lý phù hợp cho những học sinh vi phạm dựa trên các lỗi vi phạm của lớp.
      Ngôn ngữ: Tiếng Việt.
    `;
    return this.tryGenerate(prompt);
  }

  async analyzeImage(base64Data: string): Promise<string> {
    if (!this.genAI) throw new Error("API Key chưa được thiết lập");
    
    // For vision, we might need a specific model or handle parts differently
    // Current implementation uses gemini-3-flash-preview which I'll map to gemini-2.0-flash
    const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data.split(",")[1]
        }
      },
      { text: "Bạn là giám thị kiểm tra phòng nội trú. Hãy phân tích bức ảnh này và liệt kê các lỗi vi phạm nề nếp (ví dụ: chăn màn chưa gấp, rác trên sàn, đồ đạc lộn xộn, v.v.). Trả lời ngắn gọn bằng tiếng Việt." }
    ]);
    const response = await result.response;
    return response.text();
  }
}
