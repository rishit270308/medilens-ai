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
        { error: 'GEMINI_API_KEY is missing in Vercel environment variables.' },
        { status: 500 }
      );
    }

    // Clean data URI header if present
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

    // Direct REST API call that supports all Google AI Studio key formats (including AQ...)
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `Google API returned status ${response.status}`);
    }

    let text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) {
      throw new Error('Gemini returned an empty response. Verify image clarity.');
    }

    if (text.startsWith('```json')) {
      text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsedJson = JSON.parse(text);
    return NextResponse.json(parsedJson);

  } catch (err) {
    console.error('Gemini Processing Error:', err);
    return NextResponse.json(
      { error: `Gemini API Error: ${err.message || 'Processing failed'}` },
      { status: 500 }
    );
  }
}
