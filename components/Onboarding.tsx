import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { UserProfile, AppState } from '../types';

interface OnboardingProps {
  setProfile: (p: UserProfile) => void;
  setAppState: (s: AppState) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ setProfile, setAppState }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [level, setLevel] = useState<UserProfile['level']>('intermediate');
  const [topic, setTopic] = useState('');

  const handleNext = () => {
    if (step === 1 && name) setStep(2);
    else if (step === 2) setStep(3);
    else if (step === 3 && topic) {
        setProfile({ name, level, topic });
        setAppState(AppState.SESSION);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <div className="max-w-md w-full">
            
            {/* Progress */}
            <div className="flex gap-2 mb-12 justify-center">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`h-1 w-8 rounded-full transition-colors ${i <= step ? 'bg-yellow-400' : 'bg-gray-100'}`} />
                ))}
            </div>

            <div className="min-h-[300px] flex flex-col justify-between">
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-3xl font-semibold text-gray-900 mb-4 lowercase">what's your name?</h2>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="type here..."
                            className="w-full p-4 text-xl border-b-2 border-gray-200 focus:border-yellow-400 outline-none text-center bg-transparent placeholder:text-gray-300"
                            autoFocus
                        />
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-3xl font-semibold text-gray-900 mb-8 lowercase">your english level?</h2>
                        <div className="flex flex-col gap-3">
                            {(['beginner', 'intermediate', 'advanced'] as const).map((l) => (
                                <button
                                    key={l}
                                    onClick={() => setLevel(l)}
                                    className={`p-4 rounded-xl border-2 transition-all text-lg capitalize ${level === l ? 'border-yellow-400 bg-yellow-50 text-yellow-900' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-3xl font-semibold text-gray-900 mb-4 lowercase">what's on your mind?</h2>
                        <p className="text-gray-500 mb-6">pick a topic to practice</p>
                        <input 
                            type="text" 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g. job interview, travel, daily life"
                            className="w-full p-4 text-xl border-b-2 border-gray-200 focus:border-yellow-400 outline-none text-center bg-transparent placeholder:text-gray-300"
                            autoFocus
                        />
                    </div>
                )}
                
                <div className="mt-12 flex justify-center">
                    <button 
                        onClick={handleNext}
                        disabled={(step === 1 && !name) || (step === 3 && !topic)}
                        className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition-all shadow-lg"
                    >
                        <ArrowRight className="w-6 h-6" />
                    </button>
                </div>
            </div>

        </div>
    </div>
  );
};