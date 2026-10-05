import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req) {
  try {
    const { imageBase64, mimeType, language } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image missing' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not set on Vercel' }, { status: 500 });
    }

    const cleanBase64 = imageBase64.includes('base64,')
      ? imageBase64.split('base64,')[1]
      : imageBase64;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const targetLang = language || 'English';
    const prompt = `Analyze this medical prescription/report. Return ONLY JSON matching this format:
{
  "doctorName": "Doctor name or Not Specified",
  "date": "Date or Recorded",
  "medicines": [
    {
      "name": "Medicine name",
      "dosage": "Dosage",
      "frequency": "Frequency",
      "timing": "Timing (Before/After food)",
      "purpose": "Purpose in ${targetLang}"
    }
  ],
  "contraindications": ["Precautions or warnings in ${targetLang}"],
  "summaryAudioText": "Short 2-sentence voice summary in ${targetLang}."
}`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType || 'image/png',
          data: cleanBase64,
        },
      },
    ]);

    const data = JSON.parse(result.response.text());
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Analysis failed' }, { status: 500 });
  }
}
