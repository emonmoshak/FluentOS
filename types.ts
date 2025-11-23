
export enum AppState {
  LANDING = 'LANDING',
  ONBOARDING = 'ONBOARDING',
  CONNECTING = 'CONNECTING',
  SESSION = 'SESSION',
  SUMMARY = 'SUMMARY'
}

export interface UserProfile {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  topic: string;
}

export interface TranscriptionItem {
  text: string;
  isUser: boolean;
  timestamp: number;
}

export interface SessionStats {
  duration: number;
  transcripts: TranscriptionItem[];
}
