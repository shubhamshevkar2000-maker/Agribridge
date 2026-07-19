'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Mic, 
  Sparkles, 
  ThermometerSun, 
  TrendingUp, 
  Bug,
  Loader2,
  Store,
  Truck,
  Gavel,
  Sprout,
  Wallet,
  Layers,
  Landmark
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Language, languageNames } from '@/lib/translations';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const getAITranslations = (role: 'farmer' | 'buyer') => ({
  en: {
    title: role === 'farmer' ? 'KrishiSarthi AI' : 'AgriSourcing AI',
    subtitle: 'Your intelligent farming assistant for weather, crop prices, auctions, logistics, loans, and farming guidance.',
    suggestedQueries: 'Quick Actions',
    placeholder: role === 'farmer' 
      ? 'Ask about crop prices, weather, or farming advice...' 
      : 'Ask about crop sourcing, prices, or deliveries...',
    warning: 'AI assistants can make mistakes. Consider verifying critical information.',
    welcome: role === 'farmer' 
      ? 'Namaste! I am KrishiSathi, your personal AI farming assistant. How can I help you today?'
      : 'Namaste! I am AgriSourcing AI, your personal assistant for sourcing crops and managing deliveries. How can I help you today?',
    suggestions: [
      { label: '🌧️ Weather Forecast', query: 'What is the weather forecast for today?', icon: ThermometerSun },
      { label: '💰 Today\'s Market Prices', query: 'What are the crop market prices today?', icon: TrendingUp },
      { label: '📈 Live Auctions', query: 'Show me live auctions details.', icon: Gavel },
      { label: '🚚 Track Delivery', query: 'Where is my active delivery and shipment status?', icon: Truck },
      { label: '🌱 Crop Advisory', query: 'Can you give me a crop recommendation and agricultural advice?', icon: Sprout },
      { label: '🐛 Pest Identification', query: 'How do I identify and manage pests in my farm?', icon: Bug },
      { label: '🏦 Loan Status', query: 'Check my active loan status and eligibility.', icon: Landmark },
      { label: '📦 My Inventory', query: 'Show my inventory of crops.', icon: Layers },
    ],
  },
  hi: {
    title: role === 'farmer' ? 'कृषिसार्थी AI' : 'कृषि सोर्सिंग AI',
    subtitle: 'मौसम, फसल की कीमतों, नीलामियों, रसद, ऋण और खेती मार्गदर्शन के लिए आपका बुद्धिमान सहायक।',
    suggestedQueries: 'त्वरित कार्रवाई',
    placeholder: role === 'farmer'
      ? 'फसल की कीमतों, मौसम या खेती की सलाह के बारे में पूछें...'
      : 'फसल सोर्सिंग, कीमतों या डिलीवरी के बारे में पूछें...',
    warning: 'AI सहायक गलतियां कर सकता है। महत्वपूर्ण जानकारी सत्यापित करने पर विचार करें।',
    welcome: role === 'farmer'
      ? 'नमस्ते! मैं कृषिसार्थी हूँ, आपका व्यक्तिगत AI खेती सहायक। आज मैं आपकी क्या सहायता कर सकता हूँ?'
      : 'नमस्ते! मैं कृषि सोर्सिंग AI हूँ, आपका व्यक्तिगत सोर्सिंग और डिलीवरी सहायक। आज मैं आपकी क्या सहायता कर सकता हूँ?',
    suggestions: [
      { label: '🌧️ मौसम का पूर्वानुमान', query: 'आज मौसम कैसा रहेगा?', icon: ThermometerSun },
      { label: '💰 आज के मंडी भाव', query: 'आज फसलों के मंडी भाव क्या हैं?', icon: TrendingUp },
      { label: '📈 लाइव नीलामी', query: 'मुझे लाइव नीलामी का विवरण दिखाएं।', icon: Gavel },
      { label: '🚚 डिलीवरी ट्रैक करें', query: 'मेरी डिलीवरी कहाँ है और उसका स्टेटस क्या है?', icon: Truck },
      { label: '🌱 फसल परामर्श', query: 'क्या आप मुझे कोई फसल सलाह या खेती मार्गदर्शन दे सकते हैं?', icon: Sprout },
      { label: '🐛 कीट पहचान', query: 'मैं अपने खेत में कीड़ों की पहचान और प्रबंधन कैसे करूँ?', icon: Bug },
      { label: '🏦 ऋण की स्थिति', query: 'मेरे सक्रिय लोन की स्थिति और पात्रता बताएं।', icon: Landmark },
      { label: '📦 मेरी सूची (इन्वेंटरी)', query: 'मेरे क्रॉप इन्वेंटरी की सूची दिखाएं।', icon: Layers },
    ],
  },
  mr: {
    title: role === 'farmer' ? 'कृषिसार्थी AI' : 'कृषि सोर्सिंग AI',
    subtitle: 'हवामान, पिकांच्या किमती, लिलाव, वाहतूक, कर्ज आणि शेती मार्गदर्शनासाठी तुमचे बुद्धिमान सहाय्यक.',
    suggestedQueries: 'त्वरित कृती',
    placeholder: role === 'farmer'
      ? 'पिकांच्या किमती, हवामान किंवा शेतीच्या सल्ल्याबद्दल विचारा...'
      : 'पिकांचे सोर्सिंग, किमती किंवा वितरणाबद्दल विचारा...',
    warning: 'AI सहाय्यक चुका करू शकतात. महत्त्वाच्या माहितीची पडताळणी करण्याचा विचार करा.',
    welcome: role === 'farmer'
      ? 'नमस्ते! मी कृषिसार्थी आहे, तुमचा वैयक्तिक AI शेती सहाय्यक. आज मी तुम्हाला कशी मदत करू शकतो?'
      : 'नमस्ते! मी कृषि सोर्सिंग AI आहे, पिकांची खरेदी आणि वितरण व्यवस्थापित करण्यासाठी तुमचा वैयक्तिक सहाय्यक. आज मी तुम्हाला कशी मदत करू शकतो?',
    suggestions: [
      { label: '🌧️ हवामान अंदाज', query: 'आजचे हवामान कसे असेल?', icon: ThermometerSun },
      { label: '💰 आजचे पिकांचे दर', query: 'आज पिकांचे बाजार भाव काय आहेत?', icon: TrendingUp },
      { label: '📈 लाइव्ह लिलाव', query: 'मला चालू लिलावाची माहिती दाखवा.', icon: Gavel },
      { label: '🚚 डिलिव्हरी ट्रॅक करा', query: 'माझी डिलिव्हरी कुठे आहे?', icon: Truck },
      { label: '🌱 पीक सल्ला', query: 'तुम्ही मला पीक सल्ला किंवा शेती मार्गदर्शन देऊ शकता का?', icon: Sprout },
      { label: '🐛 कीड ओळखणे', query: 'मी माझ्या शेतातील किडींचे व्यवस्थापन कसे करू?', icon: Bug },
      { label: '🏦 कर्जाची स्थिती', query: 'माझ्या कर्जाची स्थिती आणि पात्रता तपासा.', icon: Landmark },
      { label: '📦 माझी इन्व्हेंटरी', query: 'माझ्या पिकांची यादी दाखवा.', icon: Layers },
    ],
  }
});

export function AIAssistant({ role }: { role: 'farmer' | 'buyer' }) {
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();

  const translations = getAITranslations(role);
  const t = translations[language];

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingText, setLoadingText] = useState('Preparing response...');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message based on language and fetch history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`/api/ai/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          const historyMessages = data.data.flatMap((interaction: any) => {
            const msgs = [];
            if (interaction.inputText) {
              msgs.push({
                id: `user-${interaction._id}`,
                sender: 'user',
                text: interaction.inputText,
                timestamp: new Date(interaction.createdAt)
              });
            }
            if (interaction.responseText) {
              msgs.push({
                id: `ai-${interaction._id}`,
                sender: 'ai',
                text: interaction.responseText,
                timestamp: new Date(interaction.createdAt)
              });
            }
            return msgs;
          });
          setMessages(historyMessages);
        } else {
          setMessages([{
            id: 'welcome',
            sender: 'ai',
            text: t.welcome,
            timestamp: new Date()
          }]);
        }
      } catch (error) {
        console.error('Failed to fetch AI history:', error);
        setMessages([{
          id: 'welcome',
          sender: 'ai',
          text: t.welcome,
          timestamp: new Date()
        }]);
      }
    };
    fetchHistory();
  }, [language, t.welcome]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // Set contextual loading text
    const lower = text.toLowerCase();
    if (lower.includes('weather') || lower.includes('rain') || lower.includes('barish') || lower.includes('mausam') || lower.includes('havaman')) {
      setLoadingText('Checking weather...');
    } else if (lower.includes('price') || lower.includes('rate') || lower.includes('mandi') || lower.includes('bhav') || lower.includes('bhaav') || lower.includes('market') || lower.includes('gehu') || lower.includes('cotton') || lower.includes('tomato')) {
      setLoadingText('Fetching market prices...');
    } else if (lower.includes('auction') || lower.includes('bid') || lower.includes('boli') || lower.includes('live')) {
      setLoadingText('Loading auction details...');
    } else if (lower.includes('delivery') || lower.includes('track') || lower.includes('shipment') || lower.includes('status') || lower.includes('transit') || lower.includes('kahan') || lower.includes('kaha')) {
      setLoadingText('Tracking shipment...');
    } else if (lower.includes('inventory') || lower.includes('crop') || lower.includes('stock') || lower.includes('fasal')) {
      setLoadingText('Retrieving inventory...');
    } else if (lower.includes('loan') || lower.includes('credit') || lower.includes('bank') || lower.includes('karz')) {
      setLoadingText('Checking loan status...');
    } else {
      setLoadingText('Preparing response...');
    }

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: text, language })
      });
      const data = await res.json();
      
      if (data.success) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'ai',
          text: data.data.response,
          timestamp: new Date()
        }]);
      } else {
        throw new Error(data.message || 'Failed to get response');
      }
    } catch (error: any) {
      console.error('Frontend AI Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'ai',
        text: error.message || (language === 'en' ? "An unexpected error occurred." : 
              language === 'hi' ? "एक अप्रत्याशित त्रुटि हुई।" :
              "एक अनपेक्षित त्रुटी आली."),
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const getSpeechLang = () => {
    const map: Record<Language, string> = { en: 'en-US', hi: 'hi-IN', mr: 'mr-IN' };
    return map[language];
  };

  const handleVoice = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'ai',
        text: language === 'en' ? 'Speech recognition is not supported in your browser. Please try Chrome or Edge.'
              : language === 'hi' ? 'आपके ब्राउज़र में वाचन पहचान समर्थित नहीं है। कृपया Chrome या Edge आज़माएं।'
              : 'तुमच्या ब्राउझरमध्ये बोलणे ओळखणे उपलब्ध नाही. कृपया Chrome किंवा Edge वापरा.',
        timestamp: new Date()
      }]);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = getSpeechLang();
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      if (finalTranscript) {
        setTranscript(finalTranscript);
      } else {
        setTranscript(interimTranscript);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      setTranscript(prev => {
        if (prev.trim()) {
          handleSend(prev.trim());
        }
        return '';
      });
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      recognitionRef.current = null;
      setTranscript('');
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'ai',
          text: language === 'en' ? 'Could not recognize speech. Please try again.'
                : language === 'hi' ? 'वाणी पहचानी नहीं जा सकी। कृपया पुनः प्रयास करें।'
                : 'बोलणे ओळखता आले नाही. कृपया पुन्हा प्रयत्न करा.',
          timestamp: new Date()
        }]);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] lg:h-[calc(100vh-14rem)] max-w-5xl mx-auto gap-6 overflow-hidden">
      
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" /> {t.title}
          </h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          {(['en', 'hi', 'mr'] as Language[]).map((lang) => (
            <Badge 
              key={lang}
              variant="outline" 
              className={`cursor-pointer transition-colors ${language === lang ? 'bg-primary text-white border-primary' : 'bg-background text-muted-foreground'}`}
              onClick={() => setLanguage(lang)}
            >
              {languageNames[lang]}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* Quick Prompts Sidebar */}
        <div className="hidden lg:flex w-64 flex-col gap-4 overflow-y-auto shrink-0">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t.suggestedQueries}</h3>
          
          {t.suggestions.map((suggestion: any, i: number) => {
            const SuggestionIcon = suggestion.icon;
            return (
              <button
                key={i}
                onClick={() => handleSend(suggestion.query)}
                className="flex items-center gap-3 p-3.5 rounded-xl glass-card border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group shadow-sm"
              >
                <div className="p-2 rounded-lg bg-secondary group-hover:bg-primary/20 text-foreground group-hover:text-primary transition-colors">
                  <SuggestionIcon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium">{suggestion.label.replace(/^[\p{Emoji}\s]+/u, '')}</span>
              </button>
            );
          })}
        </div>

        {/* Chat Interface */}
        <Card className="flex-1 flex flex-col glass-card border-border/50 overflow-hidden relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] z-0">
            <Sparkles className="w-96 h-96" />
          </div>

          {/* Messages Area */}
          <CardContent className="flex-1 p-6 overflow-y-auto z-10 flex flex-col gap-6">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex gap-4 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <Avatar className="w-8 h-8 shrink-0 border border-border mt-1">
                    {msg.sender === 'ai' ? (
                      <AvatarFallback className="bg-primary text-white"><Sparkles className="w-4 h-4" /></AvatarFallback>
                    ) : (
                      <AvatarFallback className="bg-secondary">{role === 'farmer' ? 'FM' : 'BY'}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className={`flex flex-col gap-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-3 rounded-2xl ${
                      msg.sender === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                        : 'glass border border-border/50 bg-secondary/50 rounded-tl-sm text-foreground'
                    }`}>
                      <p className="text-[15px] leading-relaxed whitespace-pre-line">{msg.text}</p>
                    </div>
                    <span className="text-xs text-muted-foreground px-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-[85%]">
                <Avatar className="w-8 h-8 shrink-0 border border-border mt-1">
                  <AvatarFallback className="bg-primary text-white"><Sparkles className="w-4 h-4" /></AvatarFallback>
                </Avatar>
                <div className="px-4 py-3 rounded-2xl glass border border-border/50 bg-secondary/50 rounded-tl-sm flex flex-col gap-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                    <span className="text-xs text-muted-foreground font-medium animate-pulse">{loadingText}</span>
                  </div>
                  <div className="flex items-center gap-1 pl-5">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input Area */}
          <div className="p-4 border-t border-border/50 bg-secondary/20 z-10 flex flex-col gap-3">
            {/* Quick Actions Scroll bar for Mobile/Tablet */}
            <div className="flex lg:hidden overflow-x-auto gap-2 pb-1 no-scrollbar max-w-full">
              {t.suggestions.map((suggestion: any, i: number) => {
                const SuggestionIcon = suggestion.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleSend(suggestion.query)}
                    className="whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-full bg-background border border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
                  >
                    <SuggestionIcon className="w-3.5 h-3.5 text-primary" />
                    <span>{suggestion.label.replace(/^[\p{Emoji}\s]+/u, '')}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 max-w-4xl mx-auto relative w-full">
              <Button 
                variant="outline" 
                size="icon" 
                className={`h-12 w-12 shrink-0 rounded-xl transition-all ${isListening ? 'bg-destructive/10 text-destructive border-destructive/30 animate-pulse' : 'bg-background hover:bg-secondary/80'}`}
                onClick={handleVoice}
                title="Speak to Assistant"
              >
                {isListening ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
              </Button>
              
              <Input 
                value={isListening ? transcript : input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isListening && handleSend(input)}
                placeholder={isListening ? (language === 'en' ? 'Listening...' : language === 'hi' ? 'सुन रहा हूँ...' : 'ऐकत आहे...') : t.placeholder}
                className={`h-12 bg-background border-border/50 rounded-xl pr-12 focus-visible:ring-primary/50 text-base w-full ${isListening ? 'border-destructive/50 text-destructive' : ''}`}
                disabled={isListening}
              />
              
              <Button 
                size="icon" 
                className="absolute right-1.5 top-1.5 h-9 w-9 bg-primary hover:bg-primary/90 text-white rounded-lg transition-transform hover:scale-105"
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isListening}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-center text-xs text-muted-foreground">
              {t.warning}
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
}
