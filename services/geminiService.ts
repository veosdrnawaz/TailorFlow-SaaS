import { GoogleGenAI, Type } from "@google/genai";
import { GarmentType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCostEstimate = async (
  garmentType: GarmentType,
  description: string,
  isUrgent: boolean
): Promise<any> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    You are an expert master tailor and boutique business manager in Pakistan.
    Analyze the following order request:
    Garment Type: ${garmentType}
    Description: ${description}
    Urgent: ${isUrgent}

    Provide a realistic cost estimate in Pakistani Rupees (PKR) and time estimate.
    Also suggest fabric requirements and potential styling tips.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedCost: { type: Type.NUMBER, description: "Estimated cost of stitching in PKR" },
            timeEstimateDays: { type: Type.NUMBER, description: "Days required to complete" },
            patternSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-4 styling or pattern suggestions"
            },
            fabricRequirements: { type: Type.STRING, description: "Amount of fabric needed" }
          },
          required: ["estimatedCost", "timeEstimateDays", "patternSuggestions", "fabricRequirements"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Cost Estimate Error:", error);
    throw error;
  }
};

export const generateCustomerMessage = async (
  customerName: string,
  orderStatus: string,
  messageTone: 'formal' | 'friendly' | 'urgent'
): Promise<string> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    Draft a short SMS/WhatsApp message for a customer.
    Customer: ${customerName}
    Order Status: ${orderStatus}
    Tone: ${messageTone}

    If status is 'Trial Ready', ask them to visit.
    If 'Delivered', thank them.
    If 'Delayed', apologize.
    Keep it under 160 characters if possible, but clear.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "Could not generate message.";
  } catch (error) {
    console.error("Gemini Message Gen Error:", error);
    return "Error generating message.";
  }
};

export const chatWithTailorBot = async (history: string[], newMessage: string) => {
    const model = "gemini-2.5-flash";
    const chat = ai.chats.create({
        model,
        config: {
            systemInstruction: "You are a helpful AI assistant for a Tailoring Shop owner. You help with business advice, fabric knowledge, stain removal tips, and trend forecasting. Keep answers concise.",
        },
        history: history.map((msg, i) => ({
             role: i % 2 === 0 ? 'user' : 'model',
             parts: [{ text: msg }]
        }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text;
}