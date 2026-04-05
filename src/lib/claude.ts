import Anthropic from '@anthropic-ai/sdk';
import type { Flashcard } from '../types';

function getClient(): Anthropic {
  const key = localStorage.getItem('anthropic_api_key');
  if (!key) throw new Error('No API key set. Please add your Anthropic API key in Settings.');
  return new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true });
}

export async function generateFlashcardsFromImage(
  base64Image: string,
  mediaType: string,
  onChunk?: (chunk: string) => void
): Promise<Flashcard[]> {
  const client = getClient();

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp', data: base64Image },
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
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      fullText += event.delta.text;
      onChunk?.(event.delta.text);
    }
  }

  // Parse the JSON response
  const cleaned = fullText.trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed)) throw new Error('Expected array from Claude');

  return parsed.map((item: { front: string; back: string }, i: number) => ({
    id: `${Date.now()}-${i}`,
    front: String(item.front || '').trim(),
    back: String(item.back || '').trim(),
  })).filter(c => c.front && c.back);
}
