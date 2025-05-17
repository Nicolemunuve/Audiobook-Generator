interface PronunciationRule {
  pattern: RegExp;
  replacement: string;
}

interface SpeechOptions {
  voice: SpeechSynthesisVoice;
  rate: number;
  pitch: number;
  volume: number;
}

interface WordHighlightEvent {
  word: string;
  startOffset: number;
  endOffset: number;
}

type HighlightCallback = (event: WordHighlightEvent) => void;

interface EmotionRule {
  pattern: RegExp;
  emotion: string;
  pitch: number;
  rate: number;
  volume: number;
}

interface SoundEffect {
  name: string;
  url: string;
  volume: number;
}

class TextToSpeechService {
  private static instance: TextToSpeechService;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private highlightCallback: HighlightCallback | null = null;
  private voiceQualityScores: Map<string, number> = new Map();
  private audioContext: AudioContext | null = null;
  private soundEffects: Map<string, AudioBuffer> = new Map();

  private pronunciationRules: PronunciationRule[] = [
    // Common abbreviations
    { pattern: /Mr\./g, replacement: 'Mister' },
    { pattern: /Mrs\./g, replacement: 'Misses' },
    { pattern: /Dr\./g, replacement: 'Doctor' },
    { pattern: /Prof\./g, replacement: 'Professor' },
    // Numbers and dates
    { pattern: /(\d{4})/g, replacement: '$1' }, // Year numbers
    { pattern: /(\d+)th/g, replacement: '$1th' }, // Ordinal numbers
    // Common words with tricky pronunciation
    { pattern: /genre/g, replacement: 'zhawn·ruh' },
    { pattern: /epitome/g, replacement: 'eh·pit·oh·mee' },
    { pattern: /paradigm/g, replacement: 'pair·uh·dime' },
    // Additional common words
    { pattern: /albeit/g, replacement: 'all·be·it' },
    { pattern: /cache/g, replacement: 'cash' },
    { pattern: /facade/g, replacement: 'fuh·saad' },
    { pattern: /segue/g, replacement: 'seg·way' },
    { pattern: /subtle/g, replacement: 'sut·tl' },
    { pattern: /queue/g, replacement: 'kyoo' },
    // Technical terms
    { pattern: /regex/g, replacement: 'redge·ex' },
    { pattern: /kubectl/g, replacement: 'kube·control' },
    { pattern: /webpack/g, replacement: 'web·pack' },
    // Punctuation handling
    { pattern: /([.!?]) /g, replacement: '$1... ' }, // Add pause after sentences
    { pattern: /([,;:]) /g, replacement: '$1 ' }, // Slight pause for other punctuation
    { pattern: /\(([^)]+)\)/g, replacement: '... $1 ...' }, // Add pauses around parentheses
  ];

  private customDictionary: Map<string, string> = new Map([
    ['SQL', 'S.Q.L.'],
    ['MySQL', 'My S.Q.L.'],
    ['nginx', 'engine x'],
    ['JSON', 'Jason'],
    ['API', 'A.P.I.'],
    ['GUI', 'G.U.I.'],
    ['CLI', 'C.L.I.'],
    ['AWS', 'A.W.S.'],
    ['DNS', 'D.N.S.'],
    ['URL', 'U.R.L.'],
    ['YAML', 'Yam·el'],
    ['JWT', 'J.W.T.'],
    ['GraphQL', 'Graph·Q.L.'],
    ['OAuth', 'O·Auth'],
  ]);

  private emotionRules: EmotionRule[] = [
    {
      pattern: /[!]{2,}|[?!]+|AMAZING|WONDERFUL|EXCITED/gi,
      emotion: 'excited',
      pitch: 1.3,
      rate: 1.2,
      volume: 1.0
    },
    {
      pattern: /\b(?:sad|crying|tears|weeping|sorrow)\b/gi,
      emotion: 'sad',
      pitch: 0.8,
      rate: 0.9,
      volume: 0.8
    },
    {
      pattern: /\b(?:angry|furious|rage|mad)\b|[!]{3,}/gi,
      emotion: 'angry',
      pitch: 1.2,
      rate: 1.3,
      volume: 1.2
    },
    {
      pattern: /\b(?:whispered|quietly|softly)\b/gi,
      emotion: 'whisper',
      pitch: 1.0,
      rate: 0.8,
      volume: 0.6
    }
  ];

  private defaultSoundEffects: SoundEffect[] = [
    { name: 'pageFlip', url: '/assets/sounds/page-flip.mp3', volume: 0.3 },
    { name: 'ambient', url: '/assets/sounds/ambient-reading.mp3', volume: 0.1 },
    { name: 'chapterEnd', url: '/assets/sounds/chapter-end.mp3', volume: 0.4 }
  ];

  private constructor() {
    this.initializeVoiceQualityScores();
    this.initializeAudioContext();
    this.loadSoundEffects();
  }

  private initializeVoiceQualityScores(): void {
    window.speechSynthesis.getVoices().forEach(voice => {
      let score = 0;
      
      // Base score for voice quality indicators
      if (voice.localService) score += 2; // Local voices are typically better
      if (voice.name.toLowerCase().includes('premium')) score += 3;
      if (voice.name.toLowerCase().includes('enhanced')) score += 3;
      if (voice.name.toLowerCase().includes('neural')) score += 4;
      
      // Language preference
      if (voice.lang.startsWith('en-')) {
        score += 2;
        if (voice.lang === 'en-US' || voice.lang === 'en-GB') score += 1;
      }
      
      // Voice clarity indicators
      if (voice.name.toLowerCase().includes('clear')) score += 2;
      if (voice.name.toLowerCase().includes('studio')) score += 2;
      if (voice.name.toLowerCase().includes('professional')) score += 2;

      this.voiceQualityScores.set(voice.name, score);
    });
  }

  private async initializeAudioContext() {
    this.audioContext = new AudioContext();
  }

  private async loadSoundEffects() {
    if (!this.audioContext) return;

    for (const effect of this.defaultSoundEffects) {
      try {
        const response = await fetch(effect.url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.soundEffects.set(effect.name, audioBuffer);
      } catch (error) {
        console.warn(`Failed to load sound effect: ${effect.name}`, error);
      }
    }
  }

  public async playSoundEffect(name: string) {
    if (!this.audioContext || !this.soundEffects.has(name)) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    const effect = this.defaultSoundEffects.find(e => e.name === name);

    source.buffer = this.soundEffects.get(name)!;
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    gainNode.gain.value = effect?.volume || 0.5;

    source.start();
  }

  private detectEmotion(text: string): EmotionRule | null {
    for (const rule of this.emotionRules) {
      if (rule.pattern.test(text)) {
        return rule;
      }
    }
    return null;
  }

  public static getInstance(): TextToSpeechService {
    if (!TextToSpeechService.instance) {
      TextToSpeechService.instance = new TextToSpeechService();
    }
    return TextToSpeechService.instance;
  }

  public getVoices(): SpeechSynthesisVoice[] {
    const allVoices = window.speechSynthesis.getVoices();
    // Sort voices by quality score
    return allVoices
      .filter(voice => {
        const score = this.voiceQualityScores.get(voice.name) || 0;
        return score >= 2; // Only return voices with minimum quality
      })
      .sort((a, b) => {
        const scoreA = this.voiceQualityScores.get(a.name) || 0;
        const scoreB = this.voiceQualityScores.get(b.name) || 0;
        return scoreB - scoreA;
      });
  }

  public setHighlightCallback(callback: HighlightCallback | null): void {
    this.highlightCallback = callback;
  }

  private splitIntoWords(text: string): string[] {
    return text.split(/\s+/).filter(word => word.length > 0);
  }

  public preProcessText(text: string): string {
    // Apply custom dictionary replacements
    let processedText = text;
    this.customDictionary.forEach((replacement, word) => {
      const wordRegex = new RegExp(`\\b${word}\\b`, 'g');
      processedText = processedText.replace(wordRegex, replacement);
    });

    // Apply pronunciation rules
    this.pronunciationRules.forEach(rule => {
      processedText = processedText.replace(rule.pattern, rule.replacement);
    });

    // Add word boundaries for better clarity
    processedText = processedText.replace(/(\w+)/g, ' $1 ').trim();
    
    // Normalize whitespace
    return processedText.replace(/\s+/g, ' ');
  }

  public speak(text: string, options: SpeechOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.stop();

        const processedText = this.preProcessText(text);
        const words = this.splitIntoWords(processedText);
        let currentWordIndex = 0;

        const utterance = new SpeechSynthesisUtterance(processedText);
        this.currentUtterance = utterance;
        
        // Apply emotion settings if detected
        const emotion = this.detectEmotion(text);
        if (emotion) {
          utterance.pitch = options.pitch * emotion.pitch;
          utterance.rate = options.rate * emotion.rate;
          utterance.volume = options.volume * emotion.volume;
        } else {
          utterance.pitch = options.pitch;
          utterance.rate = options.rate;
          utterance.volume = options.volume;
        }

        utterance.voice = options.voice;

        // Handle word boundaries for highlighting
        utterance.onboundary = (event) => {
          if (event.name === 'word' && this.highlightCallback && currentWordIndex < words.length) {
            const word = words[currentWordIndex];
            this.highlightCallback({
              word,
              startOffset: event.charIndex,
              endOffset: event.charIndex + word.length
            });
            currentWordIndex++;
          }
        };

        utterance.text = this.addProsodyMarkers(processedText);

        utterance.onend = () => {
          this.currentUtterance = null;
          this.playSoundEffect('pageFlip');
          resolve();
        };
        
        utterance.onerror = (error) => {
          this.currentUtterance = null;
          reject(error);
        };

        // Play ambient sound at low volume
        this.playSoundEffect('ambient');
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        this.currentUtterance = null;
        reject(error);
      }
    });
  }

  private addProsodyMarkers(text: string): string {
    return text
      // Add slight pauses after punctuation
      .replace(/([.!?]) /g, '$1 <break time="1s"/> ')
      .replace(/([,;:]) /g, '$1 <break time="0.5s"/> ')
      // Emphasize important words
      .replace(/\*([^*]+)\*/g, '<emphasis>$1</emphasis>')
      // Add rising intonation for questions
      .replace(/\?/g, '<prosody pitch="high">?</prosody>');
  }

  public pause(): void {
    window.speechSynthesis.pause();
  }

  public resume(): void {
    window.speechSynthesis.resume();
  }

  public stop(): void {
    if (this.currentUtterance) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  public getVoiceQualityScore(voice: SpeechSynthesisVoice): number {
    return this.voiceQualityScores.get(voice.name) || 0;
  }
}

export default TextToSpeechService; 