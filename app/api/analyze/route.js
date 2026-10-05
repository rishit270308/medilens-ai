import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 45;

export async function POST(req) {
  try {
    const { imageBase64, mimeType, language } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image uploaded' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not defined in Vercel settings.' },
        { status: 500 }
      );
    }

    const cleanBase64 = imageBase64.includes('base64,')
      ? imageBase64.split('base64,')[1]
      : imageBase64;

    const targetLang = language || 'English';

    const promptText = `
You are MediLens AI, an expert medical document digitization assistant.
Analyze this medical document or prescription image.

Tasks:
1. Extract patient details, clinician/clinic name, and prescription date.
2. Read all prescribed medicines, active salts, dosages, administration intervals, and meal timings.
3. Check for clinical safety risks, contraindications, or dietary precautions.
4. Translate all explanations and purposes into: "${targetLang}".

You must respond ONLY with a valid JSON object strictly matching this structure:
{
  "doctorName": "Doctor name or clinic name or 'Not Specified'",
  "date": "Prescription date or 'Recorded'",
  "medicines": [
    {
      "name": "Medicine name or Salt",
      "dosage": "Dosage (e.g. 500mg)",
      "frequency": "Frequency (e.g. 1-0-1 or Twice daily)",
      "timing": "After meals / Before meals",
      "purpose": "Purpose of medication in ${targetLang}"
    }
  ],
  "contraindications": [
    "Safety alert or precaution in ${targetLang}"
  ],
  "summaryAudioText": "A natural 2-sentence spoken summary in ${targetLang} describing how to take the medication."
}
Do NOT enclose the response in markdown blocks like \`\`\`json. Output raw JSON only.
`;

    const payload = {
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inline_data: {
                mime_type: mimeType || 'image/png',
                data: cleanBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        response_mime_type: 'application/json',
        temperature: 0.1,
      },
    };

    // Use gemini-2.0-flash which has a 1,500 req/day free tier quota
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || `HTTP ${res.status}`);
    }

    let text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) {
      throw new Error('Gemini could not decipher document. Ensure image is clear.');
    }

    if (text.startsWith('```json')) {
      text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    return NextResponse.json(JSON.parse(text));
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json(
      { error: `Gemini Engine Error: ${err.message}` },
      { status: 500 }
    );
  }
}
