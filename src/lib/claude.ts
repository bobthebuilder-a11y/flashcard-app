import Groq from 'groq-sdk';
import type { Flashcard } from '../types';

function getClient(): Groq {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  if (!key) throw new Error('Groq API key not configured.');
  return new Groq({ apiKey: key, dangerouslyAllowBrowser: true });
}

export async function generateFlashcardsFromImage(
  base64Image: string,
  mediaType: string,
  onChunk?: (chunk: string) => void
): Promise<Flashcard[]> {
  const client = getClient();

  const stream = await client.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    max_tokens: 2048,
    stream: true,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:${mediaType};base64,${base64Image}` },
          },
          {
            type: 'text',
            text: `Analyze this image and extract vocabulary terms, concepts, or study material to create flashcards.

Return a JSON array of flashcard objects. Each object must have:
- "front": the term, word, or concept (what the student is tested on)
- "back": the definition, explanation, or answer

Extract as many useful flashcards as you can find in the image. If it's a vocabulary list, extract each word/definition pair. If it's notes or a textbook page, extract key terms and concepts.

Respond with ONLY a valid JSON array, no other text. Example format:
[
  {"front": "photosynthesis", "back": "The process by which plants convert sunlight into food"},
  {"front": "mitosis", "back": "Cell division resulting in two identical daughter cells"}
]`,
          },
        ],
      },
    ],
  });

  let fullText = '';
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content || '';
    fullText += delta;
    if (delta) onChunk?.(delta);
  }

  const cleaned = fullText.trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed)) throw new Error('Expected array from AI');

  return parsed.map((item: { front: string; back: string }, i: number) => ({
    id: `${Date.now()}-${i}`,
    front: String(item.front || '').trim(),
    back: String(item.back || '').trim(),
  })).filter(c => c.front && c.back);
}
