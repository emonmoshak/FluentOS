import React, { useEffect, useState } from 'react';
import { Mic, MicOff, X, Square, RefreshCw } from 'lucide-react';
import { useLiveSession } from '../hooks/useLiveSession';
import { UserProfile, AppState } from '../types';
import { BlobVisualizer } from './BlobVisualizer';

interface SessionProps {
  userProfile: UserProfile;
  setAppState: (state: AppState) => void;
}

export const Session: React.FC<SessionProps> = ({ userProfile, setAppState }) => {
  const [micEnabled, setMicEnabled] = useState(true);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  
  const handleDisconnect = () => {
    setAppState(AppState.SUMMARY);
  };

  const { 
    isConnected, 
    isSpeaking, 
    volume, 
    transcripts, 
    error, 
    connect, 
    disconnect 
  } = useLiveSession({
    userProfile,
    onDisconnect: handleDisconnect
  });

  // Initial Connection
  useEffect(() => {
    connect();
    // We depend on empty array to only connect once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMic = () => {
    setMicEnabled(!micEnabled);
    // Note: In a production app, this should actually mute the MediaStreamTrack
  };

  const handleEndSession = () => {
      disconnect();
      setAppState(AppState.SUMMARY);
  };

  const handleRetry = () => {
      disconnect(); // Ensure clean state
      connect(); // Retry connection
  };

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center h-screen p-6 bg-white text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <X className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Connection Issue</h3>
            <p className="text-gray-500 mb-8 max-w-xs">{error}</p>
            <div className="flex gap-4">
                <button 
                    onClick={() => setAppState(AppState.LANDING)}
                    className="px-6 py-2 border border-gray-200 text-gray-600 rounded-full hover:bg-gray-50 transition-colors"
                >
                    Back to Home
                </button>
                <button 
                    onClick={handleRetry}
                    className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" /> Retry
                </button>
            </div>
        </div>
    )
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#FAFAFA] relative overflow-hidden">
      
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
        <div className="text-gray-400 text-sm font-medium tracking-wide uppercase">
            {isSpeaking ? 'FluentOS Speaking...' : 'Listening...'}
        </div>
        <button 
            onClick={() => setShowEndConfirm(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
            <X className="w-6 h-6 text-gray-400" />
        </button>
      </div>

      {/* End Session Modal */}
      {showEndConfirm && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-sm w-full text-center border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">ready to wrap up?</h3>
                  <div className="flex gap-4 justify-center mt-6">
                      <button 
                        onClick={() => setShowEndConfirm(false)}
                        className="px-8 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                      >
                          no
                      </button>
                      <button 
                        onClick={handleEndSession}
                        className="px-8 py-3 rounded-xl bg-yellow-400 text-yellow-900 font-medium hover:bg-yellow-500 transition-all"
                      >
                          yes
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        
        <div className="mb-12 text-center transition-opacity duration-500">
            <h2 className="text-3xl font-medium text-gray-800 mb-2 lowercase">
                {userProfile.topic}
            </h2>
            {!isConnected && (
                <p className="text-gray-400 animate-pulse lowercase">connecting to FluentOS...</p>
            )}
        </div>

        <BlobVisualizer 
            volume={volume} 
            state={!isConnected ? 'connecting' : isSpeaking ? 'speaking' : 'listening'} 
        />

        {/* Subtitles / Last transcript */}
        <div className="h-24 mt-12 w-full max-w-lg px-6 text-center flex items-center justify-center">
            {transcripts.length > 0 && (
                <p className="text-gray-500 text-lg font-light leading-relaxed opacity-80 transition-all duration-300">
                    "{transcripts[transcripts.length - 1].text}"
                </p>
            )}
        </div>

      </div>

      {/* Controls */}
      <div className="absolute bottom-12 left-0 w-full flex justify-center items-center gap-6 z-20">
        <button 
            onClick={toggleMic}
            className={`p-4 rounded-full shadow-sm transition-all duration-200 ${micEnabled ? 'bg-white hover:bg-gray-50 text-gray-800' : 'bg-red-50 text-red-500'}`}
        >
            {micEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>
      </div>

    </div>
  );
};