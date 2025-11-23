import { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '../utils/audioUtils';
import { UserProfile, TranscriptionItem } from '../types';

const API_KEY = process.env.API_KEY as string;
const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-09-2025';

interface UseLiveSessionProps {
  userProfile: UserProfile;
  onDisconnect: () => void;
}

export const useLiveSession = ({ userProfile, onDisconnect }: UseLiveSessionProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // Model is speaking
  const [volume, setVolume] = useState(0); // For visualizer
  const [transcripts, setTranscripts] = useState<TranscriptionItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Audio Context Refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Session Refs
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const isConnectingRef = useRef(false);

  const disconnect = useCallback(() => {
    // Reset connecting state immediately
    isConnectingRef.current = false;

    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then((session: any) => {
         try { session.close(); } catch(e) { console.warn("Failed to close session", e); }
      }).catch(() => {});
      sessionPromiseRef.current = null;
    }
    
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    if (scriptProcessorRef.current) {
        try { scriptProcessorRef.current.disconnect(); } catch(e) {}
        scriptProcessorRef.current = null;
    }
    if (sourceNodeRef.current) {
        try { sourceNodeRef.current.disconnect(); } catch(e) {}
        sourceNodeRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        inputAudioContextRef.current.close();
        inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        outputAudioContextRef.current.close();
        outputAudioContextRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const connect = useCallback(async () => {
    // Prevent race conditions (Strict Mode or rapid retries)
    if (isConnectingRef.current || isConnected) return;
    
    if (!API_KEY) {
      setError("API Key not found in environment variables.");
      return;
    }

    isConnectingRef.current = true;
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: API_KEY });

      // Initialize Audio Contexts
      // Force 16kHz for input to match Gemini native requirements
      try {
          inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      } catch (e) {
          console.warn("Failed to force 16kHz, falling back to default", e);
          inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      // Setup Analyzer for visualizer (output)
      analyzerRef.current = outputAudioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 32;
      analyzerRef.current.connect(outputAudioContextRef.current.destination);

      // Get Mic Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          autoGainControl: true,
          noiseSuppression: true
      }});
      streamRef.current = stream;

      // System Instruction
      const instruction = `
        You are "FluentOS", a fascinating, empathetic, and witty English conversation partner.
        The user's name is ${userProfile.name} (Level: ${userProfile.level}).
        Topic: "${userProfile.topic}".

        GOAL: Maintain a natural, flowing conversation for up to an hour.

        STYLE GUIDELINES:
        1.  **BE HUMAN**: This is the most important rule. Use fillers like "hmm", "uh-huh", "you know", "I mean", "totally" naturally. 
        2.  **VARY YOUR TONE**: Be expressive! Whisper if it's a secret, sound excited if it's cool. Avoid monotonic delivery.
        3.  **BACKCHANNEL**: If the user is telling a long story, interject with short "wow", "really?", "no way" to show you are listening.
        4.  **NO INTERROGATION**: Don't just ask questions. Share brief relevant anecdotes or opinions before passing the ball back.
        5.  **LONG FORM**: Dig deep.
      `;

      const sessionPromise = ai.live.connect({
        model: MODEL_NAME,
        callbacks: {
          onopen: async () => {
            isConnectingRef.current = false;
            setIsConnected(true);
            console.log("FluentOS Session Opened");

            // Start Input Streaming
            if (!inputAudioContextRef.current || !streamRef.current) return;
            
            // Resume context if suspended
            if (inputAudioContextRef.current.state === 'suspended') {
              await inputAudioContextRef.current.resume();
            }
            
            const source = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
            sourceNodeRef.current = source;
            
            // 2048 buffer size for lower latency (approx 128ms at 16k)
            const processor = inputAudioContextRef.current.createScriptProcessor(2048, 1, 1);
            scriptProcessorRef.current = processor;
            
            const currentSampleRate = inputAudioContextRef.current.sampleRate;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData, currentSampleRate);
              
              sessionPromise.then((session: any) => {
                if (session) {
                    try {
                        session.sendRealtimeInput({ media: pcmBlob });
                    } catch (e) {
                        console.warn("Error sending audio input", e);
                    }
                }
              });
            };

            source.connect(processor);
            processor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              setIsSpeaking(true);
              const ctx = outputAudioContextRef.current;
              
              if (ctx.state === 'suspended') {
                await ctx.resume();
              }

              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                ctx,
                24000,
                1
              );

              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              
              if (analyzerRef.current) {
                source.connect(analyzerRef.current); 
              } else {
                source.connect(ctx.destination);
              }

              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) {
                    setIsSpeaking(false);
                }
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(src => src.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
            }

            // Handle Transcriptions
            if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
                 const text = message.serverContent.modelTurn.parts[0].text;
                 setTranscripts(prev => [...prev, { text, isUser: false, timestamp: Date.now() }]);
            }
          },
          onclose: () => {
            console.log("Session closed by server");
            setIsConnected(false);
            isConnectingRef.current = false;
          },
          onerror: (e) => {
            console.error("FluentOS Live Error", e);
            isConnectingRef.current = false;
            setError("Connection interrupted. Please retry.");
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: instruction,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } 
          }
        }
      });

      sessionPromiseRef.current = sessionPromise;

    } catch (err: any) {
      console.error("Connection initiation error", err);
      isConnectingRef.current = false;
      setError(err.message || "Failed to connect");
    }
  }, [userProfile]); // Removing isConnected dependency to allow retry logic to work cleanly

  // Cleanup on unmount
  useEffect(() => {
      return () => {
          disconnect();
      }
  }, [disconnect]);

  // Visualizer Loop
  useEffect(() => {
    let animationFrame: number;
    const updateVolume = () => {
        if (analyzerRef.current && isSpeaking) {
            const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
            analyzerRef.current.getByteFrequencyData(dataArray);
            const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
            setVolume(avg);
        } else if (!isSpeaking) {
             setVolume(v => Math.max(0, v * 0.9));
        }
        animationFrame = requestAnimationFrame(updateVolume);
    };
    updateVolume();
    return () => cancelAnimationFrame(animationFrame);
  }, [isSpeaking]);

  return {
    isConnected,
    isSpeaking,
    volume,
    transcripts,
    error,
    connect,
    disconnect
  };
};