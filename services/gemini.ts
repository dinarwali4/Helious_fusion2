import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY });

export const askFusionExpert = async (
  prompt: string,
  useSearch: boolean = false
): Promise<{ text: string; sources?: any[] }> => {
  try {
    const tools = useSearch ? [{ googleSearch: {} }] : [];
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are a world-class physicist and expert on nuclear fusion energy. Your goal is to explain complex concepts simply, accurately, and with enthusiasm. If asked about companies or recent news, use the search tool to provide up-to-date info. Keep answers concise (under 150 words) unless asked for detail.",
        tools: tools,
      }
    });

    const text = response.text || "I couldn't generate a response. Please try again.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => chunk.web).filter(Boolean) || [];

    return { text, sources };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "Error communicating with the Fusion Intelligence Network." };
  }
};

export const generateQuiz = async (): Promise<string> => {
  try {
     const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate a single multiple-choice question about fusion energy with 4 options. Format it as a JSON object with keys: question, options (array of strings), correctIndex (number), explanation.",
      config: {
        responseMimeType: "application/json",
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Quiz Gen Error:", error);
    return "";
  }
}
