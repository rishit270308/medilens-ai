import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const { imageBase64, mimeType, language } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image payload is missing' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on server' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const targetLang = language || 'English';

    const prompt = `
You are MediLens AI, an expert clinical decision assistant and medical handwriting transcription system.
Analyze this handwritten prescription or laboratory diagnostic scan.

INSTRUCTIONS:
1. Decipher all cursive handwritten medicines, salts, dosages, and administration intervals.
2. Cross-reference drug-drug interactions and critical clinical alerts.
3. Translate dosage explanations, purpose, and precautions into: "${targetLang}".

STRICT OUTPUT FORMAT:
Output ONLY valid JSON matching this schema with no markdown ticks or extra text:
{
  "doctorName": "Doctor name or Clinic if visible, else 'Not Specified'",
  "date": "Prescription date if visible, else 'Current'",
  "medicines": [
    {
      "name": "Medicine Name with Brand or Salt",
      "dosage": "e.g., 500mg or 1 tablet",
      "frequency": "e.g., Twice daily (1-0-1)",
      "timing": "e.g., After food / Before food",
      "purpose": "What this medication treats in ${targetLang}"
    }
  ],
  "contraindications": [
    "Safety alert, cross-drug warning, or dietary caution in ${targetLang}"
  ],
  "summaryAudioText": "A clear, caring 2-sentence spoken summary of how and when to take these medicines, written in ${targetLang}."
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: imageBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const parsedData = JSON.parse(response.text);
    return NextResponse.json(parsedData);
  } catch (err) {
    console.error('Gemini Processing Error:', err);
    return NextResponse.json(
      { error: 'Failed to extract prescription. Please verify the image clarity and API key.' },
      { status: 500 }
    );
  }
}