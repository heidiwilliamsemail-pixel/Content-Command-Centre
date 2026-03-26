import { GoogleGenAI, Type } from "@google/genai";
import { Idea, ContentAsset } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const geminiService = {
  async distillSignal(content: string): Promise<Partial<Idea>> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Distill this raw input into a structured content idea. 
      Input: "${content}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            coreIdea: { type: Type.STRING },
            beliefChallenged: { type: Type.STRING },
            underlyingProblem: { type: Type.STRING },
            targetBuyer: { type: Type.STRING },
            reallyAbout: { type: Type.STRING },
            whyMatters: { type: Type.STRING },
            wrongApproach: { type: Type.STRING },
          },
          required: ["coreIdea", "beliefChallenged", "underlyingProblem", "targetBuyer", "reallyAbout", "whyMatters", "wrongApproach"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  },

  async multiplyContent(idea: Idea): Promise<Partial<ContentAsset>[]> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 6 different content assets based on this core idea:
      Core Idea: ${idea.coreIdea}
      Belief Challenged: ${idea.beliefChallenged}
      Underlying Problem: ${idea.underlyingProblem}
      Target Buyer: ${idea.targetBuyer}
      What it's really about: ${idea.reallyAbout}
      Why it matters: ${idea.whyMatters}
      What most people get wrong: ${idea.wrongApproach}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { 
                type: Type.STRING, 
                enum: ['Authority', 'Story', 'Breakdown', 'Contrarian', 'Punchy', 'Email'] 
              },
              content: { type: Type.STRING }
            },
            required: ["type", "content"]
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  }
};
