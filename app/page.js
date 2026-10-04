'use client';

import { useState } from 'react';
import { Upload, Volume2, ShieldAlert, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        const fullBase64 = reader.result;
        setImagePreview(fullBase64);
        setImageBase64(fullBase64.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  const processPrescription = async (overrideLang = null) => {
    if (!imageBase64) return;
    setLoading(true);
    const selectedLanguage = overrideLang || language;
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType,
          language: selectedLanguage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      alert(err.message || 'Error communicating with Gemini API.');
    } finally {
      setLoading(false);
    }
  };

  const handleSpeech = () => {
    if (!result?.summaryAudioText) return;
    const utterance = new SpeechSynthesisUtterance(result.summaryAudioText);
    if (language === 'Hindi') utterance.lang = 'hi-IN';
    else if (language === 'Gujarati') utterance.lang = 'gu-IN';
    else if (language === 'Marathi') utterance.lang = 'mr-IN';
    else utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row justify-between items-center border-b pb-6 mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <span className="bg-blue-600 text-white font-black text-xl px-3 py-1 rounded-lg">G</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">MediLens AI</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Galgotias College of Engineering & Technology • Hackdays 2.0 (Team Hackathoners)[span_0](start_span)[span_0](end_span)[span_1](start_span)[span_1](end_span)
          </p>
        </div>

        {/* Vernacular Language Switcher */}
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Language:</label>
          <select
            value={language}
            onChange={(e) => {
              const newLang = e.target.value;
              setLanguage(newLang);
              if (result) processPrescription(newLang);
            }}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="English">English</option>
            <option value="Hindi">हिंदी (Hindi)</option>
            <option value="Gujarati">ગુજરાતી (Gujarati)</option>
            <option value="Marathi">मराठी (Marathi)</option>
          </select>
        </div>
      </header>

      {/* Main Dual-Pane Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Pane: Image Input */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Upload className="w-5 h-5 text-blue-600"/>
              1. Upload Prescription / Lab Test
            </h2>

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Prescription preview"
                  className="max-h-72 mx-auto rounded-lg object-contain shadow-sm"
                />
              ) : (
                <div className="py-12">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2"/>
                  <p className="text-sm font-medium text-slate-600">Click or Drag prescription scan here</p>
                  <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, WEBP</p>
                </div>
              )}
            </div>

            <button
              onClick={() => processPrescription()}
              disabled={!imageBase64 || loading}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow"
            >
              <Sparkles className="w-5 h-5"/>
              {loading ? 'Deciphering via Gemini 1.5 Flash...' : 'Extract & Verify Clinical Plan'}
            </button>
          </div>
        </div>

        {/* Right Pane: Parsed Digital Results */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 min-h-[500px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600"/>
                2. Digitized Clinical Decision Dashboard
              </h2>
              {result && (
                <button
                  onClick={handleSpeech}
                  className="flex items-center gap-2 text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition"
                >
                  <Volume2 className="w-4 h-4"/> Listen ({language})
                </button>
              )}
            </div>

            {!result && !loading && (
              <div className="text-center py-24 text-slate-400">
                <p className="text-sm">Upload a prescription on the left to view parsed dosages, schedules, and alerts.</p>
              </div>
            )}

            {loading && (
              <div className="text-center py-24">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm font-semibold text-slate-700">Multimodal Reasoning in Progress...</p>
                <p className="text-xs text-slate-400 mt-1">Parsing cursive handwriting & cross-referencing contraindications</p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase">Doctor / Clinic</span>
                    <p className="font-semibold text-slate-800 text-sm">{result.doctorName || 'Not Specified'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase">Date of Record</span>
                    <p className="font-semibold text-slate-800 text-sm">{result.date || 'Recorded'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Prescribed Regimen</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-slate-50 text-slate-600 font-semibold text-xs">
                          <th className="py-2 px-3">Medicine / Salt</th>
                          <th className="py-2 px-3">Dosage</th>
                          <th className="py-2 px-3">Timing</th>
                          <th className="py-2 px-3">Purpose ({language})</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.medicines?.map((med, idx) => (
                          <tr key={idx} className="border-b hover:bg-slate-50/50">
                            <td className="py-3 px-3 font-bold text-slate-900">{med.name}</td>
                            <td className="py-3 px-3 text-slate-700">{med.dosage}</td>
                            <td className="py-3 px-3 font-semibold text-blue-700">{med.timing}</td>
                            <td className="py-3 px-3 text-slate-600 text-xs">{med.purpose}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {result.contraindications?.length > 0 && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                    <h3 className="text-xs font-bold uppercase text-rose-800 flex items-center gap-1.5 mb-2">
                      <ShieldAlert className="w-4 h-4 text-rose-600"/> Clinical Safety Guardrails & Interactions
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-xs text-rose-900">
                      {result.contraindications.map((alert, idx) => (
                        <li key={idx}>{alert}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}