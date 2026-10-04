'use client';

import { useState } from 'react';
import { 
  Upload, 
  Volume2, 
  ShieldAlert, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Activity, 
  Languages, 
  Pill, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      {/* Top Banner Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20 text-white">
              G
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">MediLens</span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-md">AI Agent</span>
              </div>
              <p className="text-xs text-slate-400">
                Multimodal EHR Digitizer & Decision Support System • Team Hackathoners
              </p>
            </div>
          </div>

          {/* Vernacular Language Selector */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-inner">
            <Languages className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-medium text-slate-300">Vernacular Mode:</span>
            <select
              value={language}
              onChange={(e) => {
                const newLang = e.target.value;
                setLanguage(newLang);
                if (result) processPrescription(newLang);
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-cyan-300 focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer"
            >
              <option value="English">English</option>
              <option value="Hindi">हिंदी (Hindi)</option>
              <option value="Gujarati">ગુજરાતી (Gujarati)</option>
              <option value="Marathi">मराठी (Marathi)</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Dual-Pane Workspace */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Document Upload */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-400" />
                  Prescription / Report Ingestion
                </h2>
                <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">Stage 01</span>
              </div>

              {/* Upload Dropzone */}
              <div className="relative border-2 border-dashed border-slate-700 hover:border-blue-500/60 rounded-xl p-4 transition-all duration-200 bg-slate-950/60 group cursor-pointer text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Prescription Preview"
                      className="max-h-72 mx-auto rounded-lg object-contain shadow-md border border-slate-800"
                    />
                    <p className="mt-2 text-xs text-cyan-400 font-medium">Click or drop new file to replace</p>
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6 text-blue-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-200">Upload prescription scan or PDF snapshot</p>
                    <p className="text-xs text-slate-500 mt-1">Cursive doctor notes, lab reports (JPG, PNG, WEBP)</p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => processPrescription()}
                disabled={!imageBase64 || loading}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? 'Reasoning with Gemini 1.5 Flash...' : 'Decipher & Verify Medical Plan'}
              </button>
            </div>

            {/* Quick Feature Pillars */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900/50 border border-slate-800/80 p-3 rounded-xl text-center">
                <Activity className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <p className="text-[11px] font-semibold text-slate-300">Cursive OCR</p>
                <p className="text-[10px] text-slate-500">Multimodal Vision</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800/80 p-3 rounded-xl text-center">
                <ShieldAlert className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <p className="text-[11px] font-semibold text-slate-300">OpenFDA Check</p>
                <p className="text-[10px] text-slate-500">Interaction Alerts</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800/80 p-3 rounded-xl text-center">
                <Languages className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <p className="text-[11px] font-semibold text-slate-300">Vernacular Voice</p>
                <p className="text-[10px] text-slate-500">Bhashini & TTS</p>
              </div>
            </div>
          </div>

          {/* Right Panel: Digital EHR Extraction */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm min-h-[520px] flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4 mb-6">
                  <div>
                    <h2 className="text-base font-semibold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Clinical Decision Dashboard
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Structured EHR representation with dosage schedules</p>
                  </div>
                  {result && (
                    <button
                      onClick={handleSpeech}
                      className="flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Speak Schedule ({language})
                    </button>
                  )}
                </div>

                {/* Empty State */}
                {!result && !loading && (
                  <div className="py-24 text-center">
                    <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
                      <Pill className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-300">No Document Analyzed Yet</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      Upload an ink prescription image on the left. Gemini will extract active salts, dosage, and food safety timings.
                    </p>
                  </div>
                )}

                {/* Loading State */}
                {loading && (
                  <div className="py-24 text-center">
                    <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm font-semibold text-slate-200">Extracting Handwriting & Validating...</p>
                    <p className="text-xs text-slate-500 mt-1">Grounding active salts and translating into {language}</p>
                  </div>
                )}

                {/* Results Screen */}
                {result && (
                  <div className="space-y-6">
                    {/* Header Details */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Prescribing Clinician</span>
                        <p className="text-sm font-semibold text-slate-200 mt-0.5">{result.doctorName || 'Not Specified'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Document Timestamp</span>
                        <p className="text-sm font-semibold text-slate-200 mt-0.5">{result.date || 'Recorded'}</p>
                      </div>
                    </div>

                    {/* Regimen Table */}
                    <div>
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-400" /> Prescribed Schedule & Instructions
                      </h3>
                      <div className="overflow-x-auto border border-slate-800 rounded-xl">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-medium">
                              <th className="py-2.5 px-3">Medicine / Salt</th>
                              <th className="py-2.5 px-3">Dosage</th>
                              <th className="py-2.5 px-3">Timing</th>
                              <th className="py-2.5 px-3">Purpose ({language})</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                            {result.medicines?.map((med, idx) => (
                              <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                                <td className="py-3 px-3 font-semibold text-white">{med.name}</td>
                                <td className="py-3 px-3 text-slate-300">{med.dosage}</td>
                                <td className="py-3 px-3 font-medium text-cyan-400">{med.timing}</td>
                                <td className="py-3 px-3 text-slate-400">{med.purpose}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Contraindications Warning Box */}
                    {result.contraindications?.length > 0 && (
                      <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5 mb-2">
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                          Clinical Precautions & Contraindications
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-rose-200">
                          {result.contraindications.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Card Footer */}
              <div className="border-t border-slate-800/80 pt-4 mt-6 flex justify-between items-center text-[11px] text-slate-500">
                <span>Model: Google Gemini 1.5 Flash</span>
                <span>Structured Output: Deterministic JSON</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Persistent College & Hackathon Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        Galgotias College of Engineering & Technology (GCET) • Hackdays 2.0 • Google Gemini API Track
      </footer>
    </div>
  );
}