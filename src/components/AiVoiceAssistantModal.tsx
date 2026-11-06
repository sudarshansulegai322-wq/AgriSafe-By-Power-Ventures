import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  X,
  PhoneCall,
  HelpCircle,
  AlertTriangle,
  Globe,
  Zap,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { Language } from '../types';
import { speechService, LANGUAGE_METADATA } from '../services/speechService';
import { assistantTranslations } from '../data/assistantTranslations';

interface AiVoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onOpenAdminSupport: () => void;
  initialQuery?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  isAiGenerated?: boolean;
  fastMatch?: boolean;
  suggestedQuestions?: string[];
  imageUrl?: string;
}

const welcomeMap: Record<Language, string> = {
  hi: 'नमस्ते किसान भाई! मैं आपका "डॉ. किसान AI विशेषज्ञ" हूँ। आप मुझसे फसल की किसी भी समस्या, कीड़े-मकोड़े, रोग, खाद की मात्रा, सरकारी योजनाओं (PM-Kisan, PMFBY), या कीटनाशक मिलाने की सुरक्षा के बारे में बोलकर, लिखकर या बीमार पौधे की फोटो खींचकर पूछ सकते हैं।',
  mr: 'नमस्कार शेतकरी मित्रांनो! मी आपला "डॉ. किसान AI तज्ज्ञ" आहे. पिकावरील रोग, कीटक, खतांचे योग्य प्रमाण, सरकारी योजना किंवा औषधांचे सुरक्षित मिश्रण याविषयी आपण बोलून, लिहून किंवा पिकाचा फोटो अपलोड करून विचारू शकता.',
  pa: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ! ਮੈਂ ਤੁਹਾਡਾ "ਡਾ. ਕਿਸਾਨ ਏ.ਆਈ. ਮਾਹਰ" ਹਾਂ। ਫ਼ਸਲਾਂ ਦੀ ਬਿਮਾਰੀ, ਕੀੜੇ-ਮਕੌੜੇ, ਸਪ੍ਰੇ ਦੀ ਮਾਤਰਾ, ਖਾਦ ਜਾਂ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਬਾਰੇ ਬੋਲ ਕੇ ਜਾਂ ਫ਼ੋਟੋ ਭੇਜ ਕੇ ਪੁੱਛੋ।',
  ta: 'வணக்கம் விவசாய பெருமக்களே! நான் உங்கள் "டாக்டர் கிசான் AI நிபுணர்". பயிர் நோய்கள், பூச்சி கட்டுப்பாடு, உர அளவு அல்லது அரசு திட்டங்கள் குறித்து குரல் வழியாகவோ அல்லது இலை புகைப்படத்தை பதிவேற்றியோ கேட்கலாம்.',
  te: 'నమస్కారం రైతు సోదరా! నేను మీ "డాక్టర్ కిసాన్ AI నిపుణుడిని". పంట తెగుళ్ళు, పురుగుల నివారణ, ఎరువుల మోతాదు లేదా ప్రభుత్వ పథకాల గురించి మాట్లాడి లేదా పంట ఫోటో తీసి అడగవచ్చు.',
  kn: 'ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ! ನಾನು ನಿಮ್ಮ "ಡಾ. ಕಿಸಾನ್ AI ತಜ್ಞ". ಬೆಳೆ ರೋಗಗಳು, ಕೀಟ ಬಾಧೆ, ಗೊಬ್ಬರದ ಪ್ರಮಾಣ ಅಥವಾ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಧ್ವನಿಯ ಮೂಲಕ ಅಥವಾ ಫೋಟೋ ಅಪ್ಲೋಡ್ ಮಾಡಿ ಕೇಳಿ.',
  gu: 'નમસ્તે ખેડૂત મિત્ર! હું તમારો "ડૉ. કિસાન AI નિષ્ણાત" છું. પાકના રોગ, જીવાત નિયંત્રણ, ખાતરનો ડોઝ કે સરકારી યોજનાઓ વિશે બોલીને કે પાકનો ફોટો મોકલીને સલાહ મેળવો.',
  bn: 'নমস্কার কৃষক বন্ধু! আমি আপনার "ডাক্তার কৃষক এআই বিশেষজ্ঞ"। ফসলের রোগ, পোকা দমন, সারের মাত্রা বা সরকারি প্রকল্প সম্পর্কে মুখে বলে বা ছবি তুলে প্রশ্ন করতে পারেন।',
  ml: 'നമസ്കാരം കർഷക സുഹൃത്തേ! ഞാൻ നിങ്ങളുടെ "ഡോ. കിസാൻ AI വിദഗ്ദ്ധൻ" ആണ്. വിള രോഗങ്ങൾ, കീടനാശിനി പ്രയോഗം, വളം അല്ലെങ്കിൽ സർക്കാർ പദ്ധതികളെക്കുറിച്ച് ചോദിക്കാം.',
  en: 'Welcome farmer friend! I am your "Dr. Kisan AI Specialist". Ask me ANY farming question—crop diseases, exact spray dosages, fertilizer schedules, PM-Kisan subsidies, or upload a leaf photo for instant crop diagnosis.'
};

export const AiVoiceAssistantModal: React.FC<AiVoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  language,
  setLanguage,
  onOpenAdminSupport,
  initialQuery
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceRate, setVoiceRate] = useState<'slow' | 'normal'>('slow');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [activeVoicePlayingId, setActiveVoicePlayingId] = useState<string | null>(null);

  // Crop Doctor Photo Attachment State
  const [attachedImageBase64, setAttachedImageBase64] = useState<string | null>(null);
  const [attachedImageMime, setAttachedImageMime] = useState<string>('image/jpeg');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick category tabs
  const [activeCategoryTab, setActiveCategoryTab] = useState<'diseases' | 'seeds' | 'sprays' | 'fert' | 'schemes' | 'weather'>('diseases');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevLangRef = useRef<Language>(language);
  const initialQueryHandledRef = useRef(false);
  const ui = assistantTranslations[language] || assistantTranslations['en'];

  const languagesList: { code: Language; name: string; native: string }[] = [
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'en', name: 'English', native: 'English' }
  ];

  // Topic Categories for Farmers
  const categoryTabs = [
    { id: 'diseases' as const, label: language === 'hi' ? '🐛 कीड़े व रोग' : '🐛 Pests & Diseases' },
    { id: 'seeds' as const, label: language === 'hi' ? '🌾 बीज व किस्में' : '🌾 Seeds & Sowing' },
    { id: 'sprays' as const, label: language === 'hi' ? '🧪 छिड़काव व मात्रा' : '🧪 Sprays & Doses' },
    { id: 'fert' as const, label: language === 'hi' ? '🌿 खाद व पोषण' : '🌿 Fertilizers & Soil' },
    { id: 'schemes' as const, label: language === 'hi' ? '🏛️ सरकारी योजनाएं' : '🏛️ PM-Kisan & Subsidy' },
    { id: 'weather' as const, label: language === 'hi' ? '💧 सिंचाई व मौसम' : '💧 Water & Weather' }
  ];

  const categoryQuestions: Record<string, Array<{ icon: string; text: string }>> = {
    diseases: [
      { icon: '🟡', text: language === 'hi' ? 'मेरी फसल के पत्ते पीले पड़ रहे हैं, क्या करूँ?' : 'Crop leaves are turning yellow, what should I do?' },
      { icon: '🐛', text: language === 'hi' ? 'कपास में गुलाबी सुंडी (Pink Bollworm) की रोकथाम कैसे करें?' : 'How to control Pink Bollworm in Cotton?' },
      { icon: '🌾', text: language === 'hi' ? 'धान में तना छेदक (Stem Borer) और शीथ ब्लाइट का इलाज?' : 'Treatment for Stem Borer & Sheath Blight in Paddy?' },
      { icon: '🌶️', text: language === 'hi' ? 'मिर्च में मरोड़िया रोग (Chilli Leaf Curl & Black Thrips) का इलाज?' : 'How to cure Leaf Curl Virus and Black Thrips in Chilli?' }
    ],
    seeds: [
      { icon: '🔍', text: language === 'hi' ? 'नकली बीज और सरकारी होलोग्राम की पहचान कैसे करें?' : 'How to detect counterfeit seeds using SeedTrace QR?' },
      { icon: '🌾', text: language === 'hi' ? 'कम पानी में धान की सबसे अच्छी पैदावार देने वाली किस्म?' : 'Best short-duration, water-saving paddy variety?' },
      { icon: '🌽', text: language === 'hi' ? 'मक्का (Corn) का अधिक उत्पादन देने वाला संकर बीज?' : 'Top high-yield hybrid maize seeds?' },
      { icon: '🍅', text: language === 'hi' ? 'बरसात और गर्मी के लिए सबसे अच्छा टमाटर हाइब्रिड?' : 'Best disease-tolerant hybrid tomato seed?' }
    ],
    sprays: [
      { icon: '🧪', text: language === 'hi' ? '15 लीटर वाले स्प्रे पंप में दवा की कितनी मात्रा डालनी चाहिए?' : 'Exact chemical dose per 15-litre knapsack pump?' },
      { icon: '⚠️', text: language === 'hi' ? 'क्या कॉपर आक्सीक्लोराइड को कीटनाशक के साथ मिला सकते हैं?' : 'Can I mix Copper Oxychloride with Insecticides?' },
      { icon: '🛡️', text: language === 'hi' ? 'कीटनाशक छिड़कते समय किसान को क्या सुरक्षा सावधानी रखनी चाहिए?' : 'Mandatory safety and PPE precautions while spraying?' },
      { icon: '⏰', text: language === 'hi' ? 'दवा छिड़कने के कितने दिन बाद फसल की कटाई करनी चाहिए (PHI)?' : 'What is Pre-Harvest Interval (PHI) waiting period?' }
    ],
    fert: [
      { icon: '💧', text: language === 'hi' ? 'इफको नैनो यूरिया (Nano Urea) का छिड़काव कब और कैसे करें?' : 'How and when to spray IFFCO Nano Urea Plus?' },
      { icon: '⚖️', text: language === 'hi' ? '19:19:19 और 00:52:34 खाद में क्या अंतर है और कब दें?' : 'Difference between 19:19:19 and 00:52:34 fertilizers?' },
      { icon: '🌿', text: language === 'hi' ? 'जिंक की कमी (खैरा रोग) दूर करने के लिए क्या डालें?' : 'How to cure Zinc deficiency and Khaira disease in paddy?' },
      { icon: '🌱', text: language === 'hi' ? 'जैविक खाद (जीवामृत व ट्राइकोडर्मा) से मिट्टी कैसे सुधारें?' : 'How to apply Trichoderma and organic bio-fertilizers?' }
    ],
    schemes: [
      { icon: '💰', text: language === 'hi' ? 'पीएम-किसान सम्मान निधि (PM-Kisan) की किस्त कैसे जांचें?' : 'How to check PM-Kisan 19th installment status?' },
      { icon: '🛡️', text: language === 'hi' ? 'फसल खराब होने पर प्रधानमंत्री फसल बीमा योजना (PMFBY) क्लेम कैसे करें?' : 'How to claim crop loss under PM Fasal Bima Yojana?' },
      { icon: '💳', text: language === 'hi' ? 'किसान क्रेडिट कार्ड (KCC) 4% ब्याज पर कैसे बनवाएं?' : 'How to apply for 4% subsidized Kisan Credit Card (KCC)?' },
      { icon: '🛸', text: language === 'hi' ? 'ड्रोन छिड़काव पर 50% सरकारी सब्सिडी कैसे मिलती है?' : 'How to get 50% SMAM subsidy on agricultural drone spraying?' }
    ],
    weather: [
      { icon: '🌧️', text: language === 'hi' ? 'बारिश आने वाली हो तो क्या कीटनाशक छिड़काव करना चाहिए?' : 'Can I spray chemicals if rain is forecast within 24 hours?' },
      { icon: '💧', text: language === 'hi' ? 'ड्रिप सिंचाई (टपक सिंचाई) में पानी और खाद की बचत कैसे करें?' : 'How to schedule drip fertigation for maximum water savings?' },
      { icon: '☀️', text: language === 'hi' ? 'दोपहर की तेज धूप में दवा छिड़कने से फसल क्यों जल जाती है?' : 'Why midday spraying causes leaf scorch and phytotoxicity?' },
      { icon: '🚨', text: language === 'hi' ? 'मौसम विभाग की कृषि चेतावनी (Agromet Advisory) कैसे प्राप्त करें?' : 'How to receive official ICAR weather & pest alerts?' }
    ]
  };

  // Subscribe to speech synthesis & audio state
  useEffect(() => {
    const unsub = speechService.subscribe((speaking) => {
      setIsSpeaking(speaking);
      if (!speaking) {
        setActiveVoicePlayingId(null);
      }
    });
    return () => unsub();
  }, []);

  // Initialize or update welcome greeting
  useEffect(() => {
    if (isOpen) {
      const initialText = welcomeMap[language] || welcomeMap['en'];
      const initialMsg: ChatMessage = {
        id: `welcome-${language}-${Date.now()}`,
        sender: 'ai',
        text: initialText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAiGenerated: true,
        suggestedQuestions: [
          language === 'hi' ? 'मेरी फसल के पत्ते पीले पड़ रहे हैं, क्या करूँ?' : 'Why are my crop leaves turning yellow?',
          language === 'hi' ? '15 लीटर पंप में कितनी दवा डालें?' : 'What is the dosage per 15L spray pump?',
          language === 'hi' ? 'पीएम-किसान ₹6000 की किस्त कब आएगी?' : 'How to check PM-Kisan scheme status?'
        ]
      };

      if (prevLangRef.current !== language) {
        setMessages((prev) => [...prev, initialMsg]);
        prevLangRef.current = language;
      } else if (messages.length === 0) {
        setMessages([initialMsg]);
      }

      // Handle initialQuery if passed (e.g. from product card)
      if (initialQuery && !initialQueryHandledRef.current) {
        initialQueryHandledRef.current = true;
        setTimeout(() => {
          handleSendMessage(initialQuery);
        }, 300);
      } else if (autoSpeak && messages.length === 0) {
        setTimeout(() => {
          speechService.speak(initialText, language);
          setActiveVoicePlayingId(initialMsg.id);
        }, 150);
      }
    }
  }, [isOpen, language, initialQuery]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, attachedImageBase64]);

  if (!isOpen) return null;

  // Handle Photo File Selection for Crop Doctor
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSpeechError('Please upload a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setAttachedImageBase64(base64String);
      setAttachedImageMime(file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSendMessage = async (queryText?: string, fastKey?: string) => {
    const textToSend = queryText || inputText.trim();
    const hasImage = Boolean(attachedImageBase64);

    if (!textToSend && !hasImage) return;
    if (isLoading) return;

    speechService.stop();
    setSpeechError(null);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend || (hasImage ? '📸 [Crop Leaf Photo Uploaded for Diagnosis]' : ''),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: attachedImageBase64 || undefined
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    const currentImage = attachedImageBase64;
    const currentMime = attachedImageMime;
    setAttachedImageBase64(null); // Clear image attachment preview
    setIsLoading(true);

    try {
      // Build conversation history for multi-turn reasoning
      const historyPayload = messages.slice(-4).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          language,
          history: historyPayload,
          imageBase64: currentImage,
          mimeType: currentMime,
          quickTemplateKey: fastKey
        }),
      });

      const data = await response.json();
      const replyText = data.reply || 'Please contact Kisan Call Centre Toll-Free 1800-180-1551.';

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAiGenerated: data.isAiGenerated,
        fastMatch: data.fastMatch,
        suggestedQuestions: data.suggestedQuestions
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (autoSpeak) {
        speechService.speak(replyText, language);
        setActiveVoicePlayingId(aiMsg.id);
      }
    } catch (err: any) {
      console.error('AI assistant fetch failed:', err);
      const fallbackReply = 'Please contact Kisan Call Centre Toll-Free 1800-180-1551 for immediate officer guidance.';
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      if (autoSpeak) {
        speechService.speak(fallbackReply, language);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }

    speechService.stop();
    setSpeechError(null);

    const success = speechService.startListening(
      language,
      (transcript, isFinal) => {
        setInputText(transcript);
        if (isFinal && transcript.trim().length > 2) {
          setIsListening(false);
          handleSendMessage(transcript);
        }
      },
      (errorMsg) => {
        setSpeechError(errorMsg);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    if (success) {
      setIsListening(true);
    }
  };

  const handlePlayVoice = (msgId: string, text: string) => {
    if (activeVoicePlayingId === msgId && isSpeaking) {
      speechService.stop();
      setActiveVoicePlayingId(null);
    } else {
      speechService.speak(text, language);
      setActiveVoicePlayingId(msgId);
    }
  };

  const handleLanguageSelect = (newLang: Language) => {
    setLanguage(newLang);
    speechService.stop();
    speechService.testVoice(newLang);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-emerald-500/40">
        
        {/* Header with Title and Mode Badges */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-3.5 sm:p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-extrabold text-2xl shadow-md shrink-0">
              🌾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-xl font-extrabold tracking-tight">
                  {ui.assistantTitle}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 text-amber-300 text-[10px] font-bold border border-amber-400/50 flex items-center gap-1 shadow-2xs">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  <span>Dr. Kisan 3.8 AI</span>
                </span>
              </div>
              <p className="text-xs text-emerald-200 flex items-center gap-1.5 mt-0.5">
                <span>Crop Diagnosis · Exact Spray Dosages · PM-Kisan · Seeds</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Speed Toggle */}
            <button
              onClick={() => {
                const nextRate = voiceRate === 'slow' ? 'normal' : 'slow';
                setVoiceRate(nextRate);
                speechService.setRate(nextRate);
                speechService.testVoice(language);
              }}
              title={voiceRate === 'slow' ? ui.speedSlowBtn : ui.speedNormalBtn}
              className="px-2 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-emerald-100 cursor-pointer transition-colors"
            >
              <span>{voiceRate === 'slow' ? ui.speedSlowBtn : ui.speedNormalBtn}</span>
            </button>

            {/* Close button */}
            <button
              onClick={() => {
                speechService.stop();
                speechService.stopListening();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
              aria-label="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 10-Language Quick Switcher Bar with Native Script Touch Buttons */}
        <div className="bg-emerald-950 px-3 py-2 border-b border-emerald-800 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
          <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Globe className="w-3 h-3 text-amber-300" />
            <span>{ui.voiceLangLabel}</span>
          </span>
          <div className="flex items-center gap-1">
            {languagesList.map((l) => (
              <button
                key={l.code}
                onClick={() => handleLanguageSelect(l.code)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all active:scale-95 ${
                  language === l.code
                    ? 'bg-amber-400 text-slate-950 shadow-xs ring-2 ring-amber-300'
                    : 'bg-emerald-900/70 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/50'
                }`}
              >
                {l.native}
              </button>
            ))}
          </div>
        </div>

        {/* Voice control sub-banner */}
        <div className="bg-emerald-50 border-b border-emerald-200 px-3.5 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => speechService.testVoice(language)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{ui.testVoiceBtn} ({LANGUAGE_METADATA[language]?.nativeName || 'Voice'})</span>
            </button>
            {isSpeaking && (
              <span className="text-[11px] font-bold text-amber-800 animate-pulse flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                {ui.voicePlayingNotice}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1 cursor-pointer text-[11px] text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={autoSpeak}
                onChange={(e) => setAutoSpeak(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
              />
              <span>{ui.autoSpeakCheckbox}</span>
            </label>

            <button
              onClick={onOpenAdminSupport}
              className="text-rose-700 font-bold hover:underline cursor-pointer flex items-center gap-1 text-[11px]"
            >
              <PhoneCall className="w-3 h-3" />
              <span>{ui.adminHelpLink}</span>
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 bg-slate-50/80">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[94%] sm:max-w-[88%] rounded-3xl p-3.5 sm:p-4.5 shadow-xs relative ${
                  msg.sender === 'user'
                    ? 'bg-emerald-700 text-white rounded-br-xs'
                    : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs'
                }`}
              >
                {/* AI Header info */}
                {msg.sender === 'ai' && (
                  <div className="flex items-center justify-between gap-3 pb-2 mb-2 border-b border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{ui.krishiMitraBadge}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                        Scientific Advisory
                      </span>
                    </div>

                    <button
                      onClick={() => handlePlayVoice(msg.id, msg.text)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        activeVoicePlayingId === msg.id && isSpeaking
                          ? 'bg-amber-400 text-slate-950 animate-pulse'
                          : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                      }`}
                      aria-label="Listen to voice explanation"
                    >
                      {activeVoicePlayingId === msg.id && isSpeaking ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>{ui.stopBtn}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{ui.listenBtn}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Attached Photo Preview if sent by user */}
                {msg.imageUrl && (
                  <div className="mb-2.5 rounded-2xl overflow-hidden border border-emerald-500/50 max-w-xs shadow-xs">
                    <img
                      src={msg.imageUrl}
                      alt="Crop Diagnosis Specimen"
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}

                {/* Message Content */}
                <div className="text-sm sm:text-base leading-relaxed whitespace-pre-line font-medium text-slate-900 dark:text-slate-900">
                  {msg.text}
                </div>

                {/* Interactive Suggested Follow-Up Question Chips */}
                {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Suggested Follow-Up Questions (Tap to Ask):</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedQuestions.map((sq, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSendMessage(sq)}
                          disabled={isLoading}
                          className="text-xs text-left bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-xl font-semibold cursor-pointer transition-colors active:scale-95"
                        >
                          👉 {sq}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`mt-2 text-[10px] flex items-center justify-between ${
                    msg.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'ai' && (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{ui.verifiedInfoBadge}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-2">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-bounce" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs font-bold text-slate-600">
                  Dr. Kisan AI is analyzing agricultural guidelines and formulating prescription...
                </span>
              </div>
            </div>
          )}

          {/* Speech Recognition Error Banner */}
          {speechError && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{speechError}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Carousel with 6 Specialized Category Tabs */}
        <div className="px-3.5 py-2.5 bg-slate-100/95 border-t border-slate-200 space-y-2">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategoryTab(tab.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                  activeCategoryTab === tab.id
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Topic Pills for Selected Tab */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {(categoryQuestions[activeCategoryTab] || []).map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q.text)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 hover:border-emerald-400 border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs whitespace-nowrap cursor-pointer transition-all shrink-0 active:scale-95"
              >
                <span className="text-sm">{q.icon}</span>
                <span>{q.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Crop Photo Attachment Preview Bar (if selected) */}
        {attachedImageBase64 && (
          <div className="bg-amber-50 border-t border-amber-200 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={attachedImageBase64}
                alt="Leaf Preview"
                className="w-12 h-12 rounded-xl object-cover border border-amber-300 shadow-2xs"
              />
              <div>
                <p className="text-xs font-bold text-amber-950">
                  📸 Crop Leaf Photo Attached for AI Diagnosis
                </p>
                <p className="text-[11px] text-amber-800">
                  Type your crop name or question, or tap send to diagnose instantly.
                </p>
              </div>
            </div>
            <button
              onClick={() => setAttachedImageBase64(null)}
              className="p-1.5 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-900 cursor-pointer"
              title="Remove photo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Bar with Mic, Camera Upload, Input, and Send */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex flex-col gap-2">
          {/* Active Listening Wave Animation */}
          {isListening && (
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white flex items-center justify-between text-xs font-bold animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-ping" />
                <span>{ui.listeningBanner}</span>
              </div>
              <button
                onClick={handleToggleListening}
                className="px-2 py-0.5 rounded-md bg-white/20 hover:bg-white/30 text-[11px] cursor-pointer"
              >
                {ui.closeMicBtn}
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Hidden File Input for Crop Photo */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageFileChange}
            />

            {/* Crop Photo Scan Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="बीमार पौधे या पत्ते की फोटो खींचें (Crop Doctor Photo Diagnosis)"
              className="p-3 sm:p-3.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0 active:scale-95"
            >
              <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Giant Microphone Button */}
            <button
              type="button"
              onClick={handleToggleListening}
              title={isListening ? ui.closeMicBtn : ui.assistantTitle}
              className={`p-3 sm:p-3.5 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0 active:scale-90 ${
                isListening
                  ? 'bg-rose-600 text-white animate-bounce ring-4 ring-rose-200'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
            >
              {isListening ? (
                <MicOff className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder={
                  attachedImageBase64
                    ? 'फसल का नाम लिखें या सीधे भेजें (e.g. कपास, मिर्च, टमाटर)...'
                    : isListening
                    ? ui.micListeningActivePlaceholder
                    : ui.micInputPlaceholder
                }
                className="w-full pl-4 pr-10 py-3 sm:py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-50 border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm sm:text-base font-medium text-slate-900 transition-colors"
              />
              {inputText && (
                <button
                  onClick={() => setInputText('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Send Button */}
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || (!inputText.trim() && !attachedImageBase64)}
              className="p-3 sm:p-3.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm shrink-0 active:scale-95"
            >
              <Send className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Quick Help & Admin Support Footer Link */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 px-1">
            <span className="flex items-center gap-1">
              <span>🌾 Powered by Dr. Kisan AI · Any query · 10 Languages</span>
            </span>
            <button
              onClick={onOpenAdminSupport}
              className="text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
            >
              {ui.adminDeskFooterLink}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
