import React, { useEffect, useState } from 'react';
import { Mic, MicOff, X, RefreshCw } from 'lucide-react';
import { useLiveSession } from '../hooks/useLiveSession';
import { UserProfile, AppState, SessionStats } from '../types';
import { BlobVisualizer } from './BlobVisualizer';

interface SessionProps {
  userProfile: UserProfile;
  setAppState: (state: AppState) => void;
  onSessionEnd: (stats: SessionStats) => void;
}

export const Session: React.FC<SessionProps> = ({ userProfile, setAppState, onSessionEnd }) => {
  const [micEnabled, setMicEnabled] = useState(true);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [duration, setDuration] = useState(0);
  
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
    isMicOn: micEnabled
  });

  // Initial Connection
  useEffect(() => {
    connect();
    // We depend on empty array to only connect once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer Logic
  useEffect(() => {
    let interval: number;
    if (isConnected) {
      interval = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMic = () => {
    setMicEnabled(!micEnabled);
  };

  const handleEndSession = () => {
      onSessionEnd({ duration, transcripts });
      disconnect();
      setAppState(AppState.SUMMARY);
  };

  const handleRetry = () => {
      setDuration(0);
      disconnect(); // Ensure clean state
      connect(); // Retry connection
  };

  if (error) {
    const isPermissionError = error.toLowerCase().includes('permission') || error.toLowerCase().includes('microphone');

    return (
        <div className="flex flex-col items-center justify-center h-screen p-6 bg-white text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <X className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Connection Issue</h3>
            <p className="text-gray-500 mb-8 max-w-xs">{error}</p>

            {isPermissionError && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-8 max-w-sm text-sm text-yellow-800 text-left">
                    <p className="font-semibold mb-1">How to fix:</p>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>Check your browser address bar for a blocked camera/mic icon.</li>
                        <li>Click it and allow microphone access.</li>
                        <li>Reload the page.</li>
                    </ul>
                </div>
            )}

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

  // Determine visual state
  const visualizerState = !isConnected 
    ? 'connecting' 
    : isSpeaking 
        ? 'speaking' 
        : !micEnabled 
            ? 'muted' 
            : 'listening';

  return (
    <div className="flex flex-col h-screen w-full bg-[#FAFAFA] relative overflow-hidden">
      
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-4 text-gray-400 text-sm font-medium tracking-wide uppercase">
            {isConnected && (
                <>
                    <span className="tabular-nums text-gray-600 font-semibold">{formatTime(duration)}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                </>
            )}
            <span className={isConnected ? "" : "animate-pulse"}>
                {isConnected ? (isSpeaking ? 'FluentOS Speaking...' : (!micEnabled ? 'Microphone Muted' : 'Listening...')) : 'Connecting...'}
            </span>
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
            state={visualizerState} 
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
      <div className="absolute bottom-12 left-0 w-full flex flex-col justify-center items-center gap-4 z-20">
        
        {/* Muted Indicator Pill */}
        {!micEnabled && isConnected && (
            <div className="bg-gray-800 text-white px-4 py-1.5 rounded-full text-xs font-medium tracking-wide animate-in fade-in slide-in-from-bottom-2">
                MICROPHONE MUTED
            </div>
        )}

        <div className="flex gap-6">
            <button 
                onClick={toggleMic}
                className={`p-6 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
                    micEnabled 
                    ? 'bg-white hover:bg-gray-50 text-gray-800' 
                    : 'bg-red-500 hover:bg-red-600 text-white shadow-red-200 ring-4 ring-red-100'
                }`}
            >
                {micEnabled ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
            </button>
        </div>
      </div>

    </div>
  );
};