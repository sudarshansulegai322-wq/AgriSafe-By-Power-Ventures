import { Language } from '../types';

export interface VoiceOption {
  voice: SpeechSynthesisVoice;
  name: string;
  lang: string;
  isDefault: boolean;
  isLocal: boolean;
}

export type SpeechRate = 'slow' | 'normal' | 'fast';

export const LANGUAGE_METADATA: Record<Language, {
  name: string;
  nativeName: string;
  bcp47: string;
  samplePhrase: string;
  fallbackGreeting: string;
}> = {
  hi: {
    name: 'Hindi',
    nativeName: 'हिन्दी',
    bcp47: 'hi-IN',
    samplePhrase: 'नमस्ते किसान भाई, एग्रीसेफ आवाज सेवा पूरी तरह चालू है।',
    fallbackGreeting: 'नमस्ते किसान भाई! एग्रीसेफ राष्ट्रीय कृषि इनपुट पोर्टल में आपका स्वागत है। यहां आप बीज और कीटनाशकों की प्रामाणिकता जांच सकते हैं।'
  },
  mr: {
    name: 'Marathi',
    nativeName: 'मराठी',
    bcp47: 'mr-IN',
    samplePhrase: 'नमस्कार शेतकरी बांधवांनो, ॲग्रीसेफ आवाज सेवा सुरू आहे.',
    fallbackGreeting: 'नमस्कार शेतकरी बांधवांनो! ॲग्रीसेफ राष्ट्रीय कृषी इनपुट पोर्टलवर आपले स्वागत आहे. येथे आपण बियाण्यांची सत्यता तपासू शकता.'
  },
  pa: {
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    bcp47: 'pa-IN',
    samplePhrase: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ, ਐਗਰੀਸੇਫ ਆਵਾਜ਼ ਸੇਵਾ ਚਾਲੂ ਹੈ।',
    fallbackGreeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ! ਐਗਰੀਸੇਫ ਖੇਤੀਬਾੜੀ ਪੋਰਟਲ ਤੇ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ। ਇੱਥੇ ਤੁਸੀਂ ਬੀਜਾਂ ਦੀ ਜਾਂਚ ਕਰ ਸਕਦੇ ਹੋ।'
  },
  ta: {
    name: 'Tamil',
    nativeName: 'தமிழ்',
    bcp47: 'ta-IN',
    samplePhrase: 'வணக்கம் விவசாய பெருமக்களே, அக்ரிசேப் குரல் சேவை தயாராக உள்ளது.',
    fallbackGreeting: 'வணக்கம் விவசாய பெருமக்களே! அக்ரிசேப் தளத்திற்கு வரவேற்கிறோம். விதை மற்றும் மருந்து விவரங்களை இங்கே சரிபார்க்கலாம்.'
  },
  te: {
    name: 'Telugu',
    nativeName: 'తెలుగు',
    bcp47: 'te-IN',
    samplePhrase: 'నమస్కారం రైతు సోదరులారా, అగ్రిసేఫ్ వాయిస్ సేవ సిద్ధంగా ఉంది.',
    fallbackGreeting: 'నమస్కారం రైతు సోదరులారా! అగ్రిసేఫ్ జాతీయ వ్యవసాయ పోర్టల్ కు స్వాगతం. ఇక్కడ మీరు విత్తనాల ప్రామాణికత తనిఖీ చేయవచ్చు.'
  },
  kn: {
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    bcp47: 'kn-IN',
    samplePhrase: 'ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ, ಅಗ್ರಿಸೇಫ್ ಧ್ವನಿ ಸೇವೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿದೆ.',
    fallbackGreeting: 'ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ! ಅಗ್ರಿಸೇಫ್ ರಾಷ್ಟ್ರೀಯ ಕೃಷಿ ಪೋರ್ಟಲ್ ಗೆ ಸುಸ್ವಾಗತ. ಇಲ್ಲಿ ನೀವು ಬೀಜಗಳ ಅಸಲಿತ್ವ ಪರೀಕ್ಷಿಸಬಹುದು.'
  },
  gu: {
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    bcp47: 'gu-IN',
    samplePhrase: 'નમસ્તે ખેડૂત મિત્રો, એગ્રીસેફ અવાજ સહાયક ચાલુ છે.',
    fallbackGreeting: 'નમસ્તે ખેડૂત મિત્રો! એગ્રીસેફ કૃષિ પોર્ટલમાં આપનું સ્વાગત છે. અહીં તમે બિયારણની ગુણવત્તા જાણી શકો છો.'
  },
  bn: {
    name: 'Bengali',
    nativeName: 'বাংলা',
    bcp47: 'bn-IN',
    samplePhrase: 'নমস্কার কৃষক ভাইয়েরা, এগ্রিসেফ ভয়েস সার্ভিস চালু রয়েছে।',
    fallbackGreeting: 'নমস্কার কৃষক ভাইয়েরা! এগ্রিসেফ জাতীয় কৃষি পোর্টালে আপনাদের স্বাগতম। এখানে আপনারা বীজের সত্যতা যাচাই করতে পারেন।'
  },
  ml: {
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    bcp47: 'ml-IN',
    samplePhrase: 'നമസ്കാരം കർഷക സുഹൃത്തുക്കളെ, അഗ്രിസേഫ് വോയ്‌സ് സേവനം സജീവമാണ്.',
    fallbackGreeting: 'നമസ്കാരം കർഷക സുഹൃത്തുക്കളെ! അഗ്രിസേഫ് കാർഷിക പോർട്ടലിലേക്ക് സ്വാഗതം. ഇവിടെ നിങ്ങൾക്ക് വിത്തുകളുടെ ആധികാരികത പരിശോധിക്കാം.'
  },
  en: {
    name: 'English',
    nativeName: 'English (Indian)',
    bcp47: 'en-IN',
    samplePhrase: 'Welcome farmer! AgriSafe voice assistant is ready to help.',
    fallbackGreeting: 'Welcome to AgriSafe. Authentic agricultural input verification and certified farm marketplace.'
  }
};

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private isSpeaking = false;
  private isPaused = false;
  private speechRate: SpeechRate = 'slow';
  private selectedVoicePerLang: Partial<Record<Language, string>> = {};
  private listeners: Set<(speaking: boolean, paused: boolean) => void> = new Set();
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded = false;
  private recognition: any = null;
  private isListening = false;
  
  // Client-side cache for instant zero-lag audio playback
  private audioMemoryCache: Map<string, string> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.loadVoices();
        }
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    const v = this.synth.getVoices();
    if (v && v.length > 0) {
      this.voices = v;
      this.voicesLoaded = true;
    }
  }

  public subscribe(listener: (speaking: boolean, paused: boolean) => void) {
    this.listeners.add(listener);
    listener(this.isSpeaking, this.isPaused);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.isSpeaking, this.isPaused));
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    if (this.voices.length === 0) {
      this.voices = this.synth.getVoices();
    }
    return this.voices;
  }

  public getVoicesForLanguage(lang: Language): SpeechSynthesisVoice[] {
    const all = this.getAvailableVoices();
    const meta = LANGUAGE_METADATA[lang];
    if (!meta) return all;

    const langCode = meta.bcp47.split('-')[0].toLowerCase();
    
    const matched = all.filter((v) => {
      const vLang = v.lang.toLowerCase();
      return vLang.startsWith(langCode) || v.name.toLowerCase().includes(meta.name.toLowerCase());
    });

    if (matched.length > 0) return matched;
    return all.filter((v) => v.lang.includes('IN') || v.lang.includes('in')).slice(0, 5);
  }

  public setPreferredVoice(lang: Language, voiceUriOrName: string) {
    this.selectedVoicePerLang[lang] = voiceUriOrName;
  }

  public setRate(rate: SpeechRate) {
    this.speechRate = rate;
    if (this.currentAudio) {
      this.currentAudio.playbackRate = rate === 'slow' ? 0.88 : rate === 'fast' ? 1.15 : 1.0;
    }
  }

  public getRate(): SpeechRate {
    return this.speechRate;
  }

  public cleanTextForSpeech(text: string): string {
    return text
      .replace(/[#*_`~>[\]()]/g, ' ')
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Reliable Multilingual Speech Engine: Instant Native Browser Speech with Audio Cache Fallback
  public async speak(text: string, language: Language = 'en', onComplete?: () => void) {
    this.stop();

    const cleanedText = this.cleanTextForSpeech(text);
    if (!cleanedText) {
      if (onComplete) onComplete();
      return;
    }

    const cacheKey = `${language}:${cleanedText}`;

    // 1. If audio is in memory cache, play it
    if (this.audioMemoryCache.has(cacheKey)) {
      const base64 = this.audioMemoryCache.get(cacheKey)!;
      this.playBase64Audio(base64, onComplete);
      return;
    }

    // 2. Primary Engine: Instant, zero-latency, quota-free native Browser Speech Synthesis
    if (this.synth) {
      this.speakWithBrowserSynth(cleanedText, language, onComplete);
      return;
    }

    // 3. Optional fallback for browsers without Web Speech
    try {
      const response = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanedText, language }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audioBase64) {
          this.audioMemoryCache.set(cacheKey, data.audioBase64);
          this.playBase64Audio(data.audioBase64, onComplete);
          return;
        }
      }
    } catch {
      // Graceful fallback
    }

    if (onComplete) onComplete();
  }

  private playBase64Audio(base64Data: string, onComplete?: () => void) {
    try {
      const audio = new Audio(`data:audio/wav;base64,${base64Data}`);
      this.currentAudio = audio;
      
      const rate = this.speechRate === 'slow' ? 0.88 : this.speechRate === 'fast' ? 1.15 : 1.0;
      audio.playbackRate = rate;

      audio.onplay = () => {
        this.isSpeaking = true;
        this.isPaused = false;
        this.notify();
      };

      audio.onended = () => {
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentAudio = null;
        this.notify();
        if (onComplete) onComplete();
      };

      audio.onerror = (e) => {
        console.warn('Audio playback error:', e);
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentAudio = null;
        this.notify();
        if (onComplete) onComplete();
      };

      audio.play().catch((err) => {
        console.warn('Audio play() promise rejected:', err);
        this.isSpeaking = false;
        this.notify();
        if (onComplete) onComplete();
      });
    } catch (err) {
      console.error('Failed to create audio element:', err);
      if (onComplete) onComplete();
    }
  }

  private speakWithBrowserSynth(cleanedText: string, language: Language, onComplete?: () => void) {
    if (!this.synth) {
      if (onComplete) onComplete();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    const meta = LANGUAGE_METADATA[language] || LANGUAGE_METADATA['en'];
    utterance.lang = meta.bcp47;

    if (this.speechRate === 'slow') {
      utterance.rate = 0.85;
    } else if (this.speechRate === 'fast') {
      utterance.rate = 1.15;
    } else {
      utterance.rate = 0.95;
    }

    utterance.pitch = 1.0;

    const voices = this.getAvailableVoices();
    const preferredName = this.selectedVoicePerLang[language];

    let matchedVoice: SpeechSynthesisVoice | undefined;
    if (preferredName) {
      matchedVoice = voices.find((v) => v.name === preferredName || v.voiceURI === preferredName);
    }

    if (!matchedVoice) {
      const targetPrefix = meta.bcp47.split('-')[0].toLowerCase();
      matchedVoice = voices.find((v) => v.lang.toLowerCase() === meta.bcp47.toLowerCase());
      if (!matchedVoice) {
        matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(targetPrefix));
      }
      if (!matchedVoice) {
        matchedVoice = voices.find((v) => v.name.toLowerCase().includes(meta.name.toLowerCase()));
      }
      if (!matchedVoice) {
        matchedVoice = voices.find((v) => v.lang.includes('IN') || v.lang.includes('in'));
      }
      if (!matchedVoice && voices.length > 0) {
        matchedVoice = voices[0];
      }
    }

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      this.notify();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      this.notify();
      if (onComplete) onComplete();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      this.notify();
      if (onComplete) onComplete();
    };

    this.currentUtterance = utterance;
    try {
      this.synth.speak(utterance);
    } catch (err) {
      console.error('Speech speak failed:', err);
    }
  }

  public testVoice(language: Language) {
    const meta = LANGUAGE_METADATA[language] || LANGUAGE_METADATA['en'];
    this.speak(meta.samplePhrase, language);
  }

  public stop() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {}
      this.currentAudio = null;
    }

    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
      this.currentUtterance = null;
    }

    this.isSpeaking = false;
    this.isPaused = false;
    this.notify();
  }

  public pause() {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
      this.isPaused = true;
      this.notify();
    } else if (this.synth && this.isSpeaking && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
      this.notify();
    }
  }

  public resume() {
    if (this.currentAudio && this.isPaused) {
      this.currentAudio.play().catch(() => {});
      this.isPaused = false;
      this.notify();
    } else if (this.synth && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.notify();
    }
  }

  public isSpeechSupported(): boolean {
    return Boolean(
      (typeof window !== 'undefined' && 'speechSynthesis' in window) ||
      (typeof window !== 'undefined' && 'Audio' in window)
    );
  }

  public isRecognitionSupported(): boolean {
    return Boolean(
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    );
  }

  // Voice Speech-to-Text (STT) for illiterate farmers to speak their queries
  public startListening(
    language: Language,
    onResult: (text: string, isFinal: boolean) => void,
    onError: (errorMsg: string) => void,
    onEnd: () => void
  ): boolean {
    if (!this.isRecognitionSupported()) {
      onError('Speech recognition is not supported in this browser. Please tap one of the quick questions.');
      return false;
    }

    try {
      this.stopListening();
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      const recog = new SpeechRecognition();
      const meta = LANGUAGE_METADATA[language] || LANGUAGE_METADATA['en'];
      recog.lang = meta.bcp47;
      recog.continuous = false;
      recog.interimResults = true;
      recog.maxAlternatives = 1;

      recog.onstart = () => {
        this.isListening = true;
      };

      recog.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        onResult(text, Boolean(finalTranscript));
      };

      recog.onerror = (event: any) => {
        this.isListening = false;
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          onError('Microphone access denied. Please allow microphone permission in your browser.');
        } else if (event.error === 'no-speech') {
          onError('No voice detected. Please tap the mic button and speak clearly.');
        } else {
          onError(`Voice input error: ${event.error}`);
        }
      };

      recog.onend = () => {
        this.isListening = false;
        this.recognition = null;
        onEnd();
      };

      this.recognition = recog;
      recog.start();
      return true;
    } catch (e: any) {
      console.error('Failed to start speech recognition:', e);
      onError('Could not start microphone.');
      return false;
    }
  }

  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.recognition = null;
      this.isListening = false;
    }
  }

  public getListeningStatus(): boolean {
    return this.isListening;
  }
}

export const speechService = new SpeechService();
