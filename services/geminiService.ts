
import { GoogleGenAI } from "@google/genai";

export const getDashboardInsights = async (dataContext: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';
  
  const prompt = `
    Context: Warehouse management dashboard for PEKEMA (vehicle importers).
    Data: ${JSON.stringify(dataContext)}
    
    Task: Provide a concise, professional analysis in Malay. 
    Focus on trends, potential risks in tax collection, and suggestions for optimization.
    Format the response with bullet points and clear sections.
    Include a "Ramalan AI" (AI Forecast) section.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 2000 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Insights Error:", error);
    return "Maaf, sistem sedang sibuk. Sila cuba sebentar lagi untuk analisis AI.";
  }
};
