
import React, { useEffect, useState } from 'react';
import { AppState, SessionStats, UserProfile } from '../types';
import { GoogleGenAI, Type } from '@google/genai';
import { Loader2 } from 'lucide-react';

interface SummaryProps {
  setAppState: (s: AppState) => void;
  sessionStats: SessionStats | null;
  userProfile: UserProfile;
}

interface AnalysisData {
  feedback: string;
  newWords: string[];
  highlights: string[];
}

export const Summary: React.FC<SummaryProps> = ({ setAppState, sessionStats, userProfile }) => {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateSummary = async () => {
      if (!sessionStats || sessionStats.transcripts.length === 0) {
        setAnalysis({
            feedback: "We couldn't capture enough conversation for a detailed analysis, but keep practicing! Consistency is key.",
            newWords: [],
            highlights: ["Started a session", "Practiced English"]
        });
        setLoading(false);
        return;
      }

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const transcriptText = sessionStats.transcripts
            .map(t => `${t.isUser ? 'Student' : 'AI'}: ${t.text}`)
            .join('\n');

        const prompt = `
          Analyze this English practice session.
          Student Name: ${userProfile.name}
          Level: ${userProfile.level}
          Topic: ${userProfile.topic}
          
          Transcript:
          ${transcriptText}
          
          Provide a JSON response with:
          1. feedback: A warm, specific paragraph (approx 60 words) about their performance. Address them by name.
          2. newWords: A list of 4 interesting or sophisticated vocabulary words relevant to the topic that were used or suggested during the chat.
          3. highlights: A list of 2 short specific strengths (e.g. "Good use of past tense", "Clear pronunciation").
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    feedback: { type: Type.STRING },
                    newWords: { type: Type.ARRAY, items: { type: Type.STRING } },
                    highlights: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
            }
          }
        });

        const text = response.text;
        if (text) {
            setAnalysis(JSON.parse(text));
        }
      } catch (e) {
        console.error("Summary generation failed", e);
        setAnalysis({
            feedback: "Great effort today! We encountered a glitch analyzing the details, but you spoke for " + Math.floor(sessionStats.duration / 60) + " minutes.",
            newWords: [],
            highlights: ["Completed session"]
        });
      } finally {
        setLoading(false);
      }
    };

    generateSummary();
  }, [sessionStats, userProfile]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl mt-12">
        <h1 className="text-4xl font-serif mb-2 text-gray-900">session recap</h1>
        <p className="text-gray-500 mb-12 lowercase">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric'})}</p>

        {loading ? (
            <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 mb-8 flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="w-10 h-10 text-yellow-400 animate-spin mb-4" />
                <p className="text-gray-400 text-lg animate-pulse">analyzing your conversation...</p>
            </div>
        ) : (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex gap-3 mb-6 flex-wrap">
                    {analysis?.highlights.map((highlight, i) => (
                        <span key={i} className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${i % 2 === 0 ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                            {highlight}
                        </span>
                    ))}
                    {!analysis?.highlights.length && (
                         <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium uppercase tracking-wider">Practice</span>
                    )}
                </div>
                
                <h3 className="text-xl font-medium mb-4">thoughts & feedback</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                    {analysis?.feedback}
                </p>

                <div className="p-4 bg-gray-50 rounded-2xl">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Vocabulary Gems</h4>
                    <div className="flex flex-wrap gap-2">
                        {analysis?.newWords.length ? analysis.newWords.map(word => (
                            <span key={word} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 text-sm font-medium">
                                {word}
                            </span>
                        )) : (
                            <span className="text-gray-400 text-sm italic">Keep talking to discover new words!</span>
                        )}
                    </div>
                </div>
            </div>
        )}

        <button 
            onClick={() => setAppState(AppState.LANDING)}
            className="w-full py-4 bg-black text-white rounded-2xl font-medium hover:bg-gray-800 transition-colors"
        >
            start new session
        </button>
      </div>
    </div>
  );
};
