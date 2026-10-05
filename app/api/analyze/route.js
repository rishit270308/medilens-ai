import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req) {
  try {
    const { imageBase64, mimeType, language } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image uploaded' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Environment Variable Missing: GEMINI_API_KEY is not defined in Vercel settings.' },
        { status: 500 }
      );
    }

    const cleanBase64 = imageBase64.includes('base64,')
      ? imageBase64.split('base64,')[1]
      : imageBase64;

    const genAI = new GoogleGenerativeAI(apiKey);

    // Use the latest supported model alias with fallback support
    let model;
    try {
      model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash-latest',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });
    } catch {
      model = genAI.getGenerativeModel({
        model: 'gemini-1.5-pro-latest',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });
    }

    const targetLang = language || 'English';

    const prompt = `
You are MediLens AI, an expert multimodal clinical decision engine and EHR transcription agent.
Analyze the provided medical document (prescription or diagnostic lab test).

TASKS:
1. Extract the prescribing doctor or clinic, and the record date.
2. Accurately decipher all medications, dosages, frequencies, and administration timings.
3. Identify relevant drug-drug contraindications, precautions, or safety alerts.
4. Translate dosage directions and clinical notes into: "${targetLang}".

You must return valid JSON matching this schema:
{
  "doctorName": "Doctor / Clinic name or 'Not Specified'",
  "date": "Prescription date or 'Recorded'",
  "medicines": [
    {
      "name": "Medicine name / Active salt",
      "dosage": "Dosage (e.g., 500 mg)",
      "frequency": "Frequency (e.g., Twice daily / 1-0-1)",
      "timing": "e.g., After meals / Before meals",
      "purpose": "Clinical purpose in ${targetLang}"
    }
  ],
  "contraindications": [
    "Safety alert, cross-interaction, or food caution in ${targetLang}"
  ],
  "summaryAudioText": "A warm, natural 2-sentence conversational instruction in ${targetLang} explaining clearly how to take this medication."
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

    const responseText = result.response.text().trim();
    const data = JSON.parse(responseText);
    return NextResponse.json(data);

  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json(
      { error: `API Diagnostic Error: ${err.message || 'Unknown processing error'}` },
      { status: 500 }
    );
  }
}
