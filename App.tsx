
import React, { useState } from 'react';
import { AppState, UserProfile, SessionStats } from './types';
import { Onboarding } from './components/Onboarding';
import { Session } from './components/Session';
import { Summary } from './components/Summary';
import { ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    level: 'intermediate',
    topic: ''
  });
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);

  const renderContent = () => {
    switch (appState) {
      case AppState.LANDING:
        return (
          <div className="min-h-screen bg-white flex flex-col">
            {/* Navbar */}
            <nav className="w-full p-6 flex justify-between items-center">
                <div className="text-2xl font-bold tracking-tighter">FluentOS</div>
                {/* Buttons removed */}
            </nav>
            
            {/* Hero */}
            <main className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-7xl font-semibold text-gray-900 mb-8 tracking-tight leading-tight">
                    speak freely.<br/>
                    fluent forever.
                </h1>
                <p className="text-xl text-gray-500 mb-12 max-w-xl">
                    Your ultra-realistic AI language partner. Practice conversations for hours, free from judgment, full of flow.
                </p>
                
                <button 
                    onClick={() => setAppState(AppState.ONBOARDING)}
                    className="px-8 py-4 bg-yellow-400 text-yellow-950 font-semibold rounded-2xl text-lg hover:scale-105 transition-transform shadow-xl shadow-yellow-200 flex items-center gap-2"
                >
                    start talking <ArrowRight className="w-5 h-5" />
                </button>
                
                <div className="mt-16 text-xs text-gray-400 uppercase tracking-widest">
                    Developed By Md Emon Mosahk
                </div>
            </main>
          </div>
        );
      
      case AppState.ONBOARDING:
        return <Onboarding setProfile={setUserProfile} setAppState={setAppState} />;
      
      case AppState.SESSION:
        return <Session 
          userProfile={userProfile} 
          setAppState={setAppState} 
          onSessionEnd={setSessionStats}
        />;

      case AppState.SUMMARY:
        return <Summary 
          setAppState={setAppState} 
          sessionStats={sessionStats}
          userProfile={userProfile}
        />;

      default:
        return <div>Error</div>;
    }
  };

  return (
    <div className="antialiased text-gray-900">
      {renderContent()}
    </div>
  );
};

export default App;
