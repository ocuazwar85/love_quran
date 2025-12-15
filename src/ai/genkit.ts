import { genkit, GenkitPlugin } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { GEMINI_API_KEY } from '@/lib/gemini-api-key';

const plugins: GenkitPlugin[] = [];

if (GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_API_KEY_HERE') {
  plugins.push(
    googleAI({
      apiKey: GEMINI_API_KEY,
    })
  );
}

export const ai = genkit({
  plugins,
});
