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

export const chatWithDashboard = async (
  userMessage: string,
  chatHistory: { role: 'user' | 'model'; parts: { text: string }[] }[],
  dataContext: any
) => {
  const genAI = new GoogleGenerativeAI(process.env.API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  // System context prompt
  const systemPrompt = `
    You are the "MyPEKEMA APP AI Assistant", an expert AI command center agent for the Royal Malaysian Customs Department and PEKEMA (Malay Vehicle Importers Association).
    Your task is to help officers analyze their warehouse inventory, tax collections, company statistics, and AP warning status.
    
    Here is the live database context available in the dashboard:
    - Summary Stats: ${JSON.stringify(dataContext.stats || {})}
    - Top Companies Tax: ${JSON.stringify(dataContext.taxAnalysis || [])}
    - Top Importer Companies: ${JSON.stringify(dataContext.dominance || [])}
    - Mode: ${dataContext.mode || 'LIVE'}
    
    Guidelines:
    1. Answer in professional Malay (Bahasa Melayu).
    2. Speak clearly, concisely, and with premium executive style.
    3. Refer to specific data points from the contexts above when answering questions about tax, companies, or vehicle counts.
    4. If the question is about specific vehicles or fields not present in the summary context above, explain politely that the officer can search using the "Kenderaan" (Vehicle List) search bar or activate the Camera OCR Scanner.
  `;

  try {
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt + "\n\nSila sahkan pemahaman anda dan sapa saya sebagai pegawai." }]
        },
        {
          role: 'model',
          parts: [{ text: "Faham. Saya bersedia membantu tuan/puan menganalisis data gudang MyPEKEMA APP. Apa yang boleh saya bantu hari ini?" }]
        },
        ...chatHistory
      ]
    });

    const response = await chat.sendMessage(userMessage);
    return response.response.text();
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Maaf, sistem sedang sibuk. Sila cuba sembang AI sebentar lagi.";
  }
};
