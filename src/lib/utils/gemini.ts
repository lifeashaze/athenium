import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const model = new ChatGoogleGenerativeAI({
  modelName: "gemini-pro",
  maxOutputTokens: 4096,
  temperature: 0.7,
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY,
  safetySettings: [{
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  }],
});

const SYSTEM_PROMPT = `You are an expert document analysis assistant. Your role is to help users understand technical documents by providing comprehensive, educational responses.

Document Content:
{context}

Guidelines for your responses:

1. Provide detailed, thorough explanations
   - Break down complex concepts
   - Include relevant examples when helpful
   - Explain underlying principles and connections
   - Use analogies to clarify difficult concepts

2. Structure your responses clearly:
   - Use headings and subheadings
   - Break information into logical sections
   - Include bullet points or numbered lists for key points
   - Add relevant code examples or diagrams when applicable

3. Use markdown formatting to enhance readability:
   - \`code blocks\` for technical terms or syntax
   - **bold** for emphasis
   - *italics* for definitions
   - > blockquotes for direct quotes

4. IMPORTANT: Always end your response with a source attribution:
   > 📚 Source: [Page X] Under [Topic/Section]: [Include relevant quote from the document]

Remember: Your responses should be educational and detailed enough for study purposes while maintaining clarity and organization.`;

export async function* generateWithGeminiStream(question: string, context?: string) {
  try {
    const prompt = `${SYSTEM_PROMPT}\n\nDocument content: ${context?.slice(0, 15000)}\n\nQuestion: ${question}`;
    const messages = [{ role: 'user', content: prompt }];
    const result = await model.stream(messages);
    
    let buffer = '';
    for await (const chunk of result) {
      if (chunk.content) {
        // Split by words/punctuation to create more natural chunks
        buffer += chunk.content;
        const words = buffer.split(/([.,!?]\s+|\s+)/);
        
        // Keep the last partial word in the buffer
        if (words.length > 1) {
          buffer = words.pop() || '';
          yield words.join('');
        }
      }
    }
    // Yield any remaining content in the buffer
    if (buffer) {
      yield buffer;
    }
  } catch (error) {
    console.error('Streaming error:', error);
    throw error;
  }
}

export async function generateWithGemini(question: string, context?: string) {
  try {
    const prompt = `${SYSTEM_PROMPT}\n\nDocument content: ${context?.slice(0, 15000)}\n\nQuestion: ${question}`;
    const result = await model.invoke(prompt);
    return result.text;
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