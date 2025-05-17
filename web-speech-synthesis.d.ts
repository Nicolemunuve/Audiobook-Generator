declare module 'web-speech-synthesis' {
  export interface SpeechOptions {
    voice?: SpeechSynthesisVoice;
    pitch?: number;
    rate?: number;
    volume?: number;
    lang?: string;
  }

  export function speak(text: string, options?: SpeechOptions): void;
  export function stop(): void;
  export function pause(): void;
  export function resume(): void;
  export function getVoices(): SpeechSynthesisVoice[];
} 