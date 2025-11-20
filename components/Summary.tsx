import React from 'react';
import { AppState } from '../types';

interface SummaryProps {
  setAppState: (s: AppState) => void;
}

export const Summary: React.FC<SummaryProps> = ({ setAppState }) => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl mt-12">
        <h1 className="text-4xl font-serif mb-2 text-gray-900">session recap</h1>
        <p className="text-gray-500 mb-12 lowercase">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric'})}</p>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
            <div className="flex gap-3 mb-6">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium uppercase tracking-wider">vocabulary</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium uppercase tracking-wider">flow</span>
            </div>
            
            <h3 className="text-xl font-medium mb-4">thoughts & feedback</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
                Great job today! You showed confidence in discussing your topic. 
                Try to focus on using past tense verbs more consistently when telling stories.
                Your pronunciation of "schedule" and "comfortable" has improved.
            </p>

            <div className="p-4 bg-gray-50 rounded-2xl">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">New Words Used</h4>
                <div className="flex flex-wrap gap-2">
                    {['resilient', 'perspective', 'challenging', 'adaptable'].map(word => (
                        <span key={word} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 text-sm">
                            {word}
                        </span>
                    ))}
                </div>
            </div>
        </div>

        <button 
            onClick={() => setAppState(AppState.LANDING)}
            className="w-full py-4 bg-black text-white rounded-2xl font-medium hover:bg-gray-800 transition-colors"
        >
            continue
        </button>
      </div>
    </div>
  );
};