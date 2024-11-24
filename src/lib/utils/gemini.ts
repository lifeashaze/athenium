import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY!);

// Configure safety settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
].filter(setting => Object.values(HarmCategory).includes(setting.category));

export async function* generateWithGeminiStream(prompt: string, pdfContent?: string) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      safetySettings,
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.7,
        candidateCount: 1,
      },
    });

    const chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.7,
        candidateCount: 1,
      },
    });

    if (pdfContent) {
      const contextPrompt = `You are an expert programming tutor analyzing this document:
${pdfContent}

Provide structured responses with:
1. Core Concept
2. Detailed Explanation
3. Technical Details
4. Practical Example
5. Key Points
6. Source Reference

Use markdown formatting and emojis for readability.`;
      
      await chat.sendMessage(contextPrompt);
    }

    const result = await chat.sendMessageStream(prompt);
    
    for await (const chunk of result.stream) {
      yield chunk.text();
    }
  } catch (error) {
    throw error;
  }
}

export async function generateWithGemini(prompt: string, pdfContent?: string) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      safetySettings,
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.7,
      },
    });

    const chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.7,
      },
    });

    if (pdfContent) {
      const contextPrompt = `You are analyzing the following document content:

${pdfContent}

Please provide responses based on this content, using markdown formatting for better readability.
When answering questions, cite specific sections or pages when possible.`;
      
      await chat.sendMessage(contextPrompt);
    }

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

export function parseRequirementsFromGeminiResponse(text: string): string[] {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('- '))
    .map(line => line.substring(2));
} 