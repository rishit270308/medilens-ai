import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';
export const maxDuration = 45;

export async function POST(req) {
  try {
    const { imageBase64, mimeType, language } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image uploaded.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on Vercel environment variables.' },
        { status: 500 }
      );
    }

    // Strip base64 metadata header if present
    const cleanBase64 = imageBase64.includes('base64,')
      ? imageBase64.split('base64,')[1]
      : imageBase64;

    // Force stable v1 API version to prevent v1beta 404 endpoint routing errors
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel(
      {
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      },
      { apiVersion: 'v1' }
    );

    const targetLang = language || 'English';

    const prompt = `
You are MediLens AI, an expert clinical decision assistant and optical prescription deciphering engine.
Analyze this medical document, doctor's prescription, or laboratory diagnostic report.

INSTRUCTIONS:
1. Accurately decipher all clinician handwritten notes, active pharmaceutical salts, dosage forms, strengths, and frequencies.
2. Cross-reference drug-drug interactions, dietary alerts, and critical contraindications.
3. Translate all explanations, purposes, and schedules into: "${targetLang}".

STRICT OUTPUT FORMAT:
You must respond ONLY with a valid, parseable JSON object matching this schema exactly:
{
  "doctorName": "Doctor name or Clinic if visible, else 'Not Specified'",
  "date": "Prescription date if visible, else 'Recorded'",
  "medicines": [
    {
      "name": "Medicine name with brand or generic salt",
      "dosage": "e.g., 500mg or 1 tablet",
      "frequency": "e.g., Twice daily (1-0-1)",
      "timing": "e.g., After food / Before food",
      "purpose": "What this medication treats in ${targetLang}"
    }
  ],
  "contraindications": [
    "Safety alert, interaction, or clinical precaution in ${targetLang}"
  ],
  "summaryAudioText": "A caring, clear 2-sentence voice summary in ${targetLang} telling the patient how and when to take their medicines."
}
`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType || 'image/png',
          data: cleanBase64,
        },
      },
    ]);

    let text = result.response.text().trim();
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsedJson = JSON.parse(text);
    return NextResponse.json(parsedJson);

  } catch (err) {
    console.error('Gemini Extraction Error:', err);
    return NextResponse.json(
      { error: `Gemini API Error: ${err.message || 'Processing failed'}` },
      { status: 500 }
    );
  }
}
