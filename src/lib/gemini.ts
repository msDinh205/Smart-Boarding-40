import { GoogleGenAI } from "@google/genai";

const MODELS = [
  "gemini-3-flash-preview",
  "gemini-3-pro-preview",
  "gemini-2.5-flash"
];

export const getApiKey = () => {
  return localStorage.getItem('gemini_api_key') || process.env.GEMINI_API_KEY || '';
};

export const saveApiKey = (key: string) => {
  localStorage.setItem('gemini_api_key', key);
};

export const getSelectedModel = () => {
  return localStorage.getItem('gemini_model') || MODELS[0];
};

export const saveSelectedModel = (model: string) => {
  localStorage.setItem('gemini_model', model);
};

export async function generateWithFallback(prompt: string, options: { responseMimeType?: string } = {}) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key is missing. Please set it in Settings.");

  const genAI = new GoogleGenAI(apiKey);
  const preferredModel = getSelectedModel();
  
  // Try preferred model first, then the rest in order
  const modelsToTry = [preferredModel, ...MODELS.filter(m => m !== preferredModel)];
  
  let lastError: any = null;
  
  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: options.responseMimeType ? { responseMimeType: options.responseMimeType } : undefined,
      });
      return result.response.text();
    } catch (error: any) {
      console.error(`Error with model ${modelName}:`, error);
      lastError = error;
      // Continue to next model
    }
  }
  
  throw lastError || new Error("All models failed.");
}
