import { GoogleGenerativeAI } from "@google/generative-ai";

export const getDashboardInsights = async (dataContext: any) => {
  const genAI = new GoogleGenerativeAI(process.env.API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  const prompt = `
    Context: Warehouse management dashboard for PEKEMA (vehicle importers).
    Data: ${JSON.stringify(dataContext)}
    
    Task: Provide a concise, professional analysis in Malay. 
    Focus on trends, potential risks in tax collection, and suggestions for optimization.
    Format the response with bullet points and clear sections.
    Include a "Ramalan AI" (AI Forecast) section.
  `;

  try {
    const response = await model.generateContent(prompt);
    return response.response.text();
  } catch (error) {
    console.error("AI Insights Error:", error);
    return "Maaf, sistem sedang sibuk. Sila cuba sebentar lagi untuk analisis AI.";
  }
};
