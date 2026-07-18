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
  Truck
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const getTranslations = (role: 'farmer' | 'buyer') => ({
  en: {
    title: role === 'farmer' ? 'KrishiSathi AI' : 'AgriSourcing AI',
    subtitle: 'Powered by Groq',
    suggestedQueries: 'Suggested Queries',
    placeholder: role === 'farmer' 
      ? 'Ask about crop prices, weather, or farming advice...' 
      : 'Ask about crop sourcing, prices, or deliveries...',
    warning: 'AI assistants can make mistakes. Consider verifying critical information.',
    welcome: role === 'farmer' 
      ? 'Namaste! I am KrishiSathi, your personal AI farming assistant. How can I help you today?'
      : 'Namaste! I am AgriSourcing AI, your personal assistant for sourcing crops and managing deliveries. How can I help you today?',
    suggestions: role === 'farmer' ? [
      { label: 'Check Crop Prices', query: 'What is the price of Tomatoes in Nashik?', icon: TrendingUp },
      { label: 'Weather Forecast', query: 'Will it rain this week?', icon: ThermometerSun },
      { label: 'Pest Identification', query: 'My leaves have brown spots, what disease is it?', icon: Bug },
    ] : [
      { label: 'Source Organic Onions', query: 'Where can I source organic onions in Nashik?', icon: Store },
      { label: 'Wheat Price Trends', query: 'What are the seasonal price trends for Wheat?', icon: TrendingUp },
      { label: 'Delivery Process', query: 'How do deliveries get tracked and managed on Agribridge?', icon: Truck },
    ],
  },
  hi: {
    title: role === 'farmer' ? 'कृषिसार्थी AI' : 'कृषि सोर्सिंग AI',
    subtitle: 'Groq द्वारा संचालित',
    suggestedQueries: 'सुझाए गए प्रश्न',
    placeholder: role === 'farmer'
      ? 'फसल की कीमतों, मौसम या खेती की सलाह के बारे में पूछें...'
      : 'फसल सोर्सिंग, कीमतों या डिलीवरी के बारे में पूछें...',
    warning: 'AI सहायक गलतियां कर सकता है। महत्वपूर्ण जानकारी सत्यापित करने पर विचार करें।',
    welcome: role === 'farmer'
      ? 'नमस्ते! मैं कृषिसार्थी हूँ, आपका व्यक्तिगत AI खेती सहायक। आज मैं आपकी क्या सहायता कर सकता हूँ?'
      : 'नमस्ते! मैं कृषि सोर्सिंग AI हूँ, आपका व्यक्तिगत सोर्सिंग और डिलीवरी सहायक। आज मैं आपकी क्या सहायता कर सकता हूँ?',
    suggestions: role === 'farmer' ? [
      { label: 'फसल की कीमतें देखें', query: 'नासिक में टमाटर की कीमत क्या है?', icon: TrendingUp },
      { label: 'मौसम का पूर्वानुमान', query: 'क्या इस सप्ताह बारिश होगी?', icon: ThermometerSun },
      { label: 'कीट की पहचान', query: 'मेरी पत्तियों पर भूरे धब्बे हैं, यह कौन सी बीमारी है?', icon: Bug },
    ] : [
      { label: 'ऑर्गेनिक प्याज सोर्स करें', query: 'मैं नासिक में ऑर्गेनिक प्याज कहाँ से खरीद सकता हूँ?', icon: Store },
      { label: 'गेहूं की कीमत के रुझान', query: 'गेहूं के लिए मौसमी मूल्य रुझान क्या हैं?', icon: TrendingUp },
      { label: 'वितरण प्रक्रिया', query: 'एग्रीब्रिज पर डिलीवरी को कैसे ट्रैक और प्रबंधित किया जाता है?', icon: Truck },
    ],
  },
  mr: {
    title: role === 'farmer' ? 'कृषिसार्थी AI' : 'कृषि सोर्सिंग AI',
    subtitle: 'Groq द्वारे समर्थित',
    suggestedQueries: 'सुचवलेले प्रश्न',
    placeholder: role === 'farmer'
      ? 'पिकांच्या किमती, हवामान किंवा शेतीच्या सल्ल्याबद्दल विचारा...'
      : 'पिकांचे सोर्सिंग, किमती किंवा वितरणाबद्दल विचारा...',
    warning: 'AI सहाय्यक चुका करू शकतात. महत्त्वाच्या माहितीची पडताळणी करण्याचा विचार करा.',
    welcome: role === 'farmer'
      ? 'नमस्ते! मी कृषिसार्थी आहे, तुमचा वैयक्तिक AI शेती सहाय्यक. आज मी तुम्हाला कशी मदत करू शकतो?'
      : 'नमस्ते! मी कृषि सोर्सिंग AI आहे, पिकांची खरेदी आणि वितरण व्यवस्थापित करण्यासाठी तुमचा वैयक्तिक सहाय्यक. आज मी तुम्हाला कशी मदत करू शकतो?',
    suggestions: role === 'farmer' ? [
      { label: 'पिकांच्या किमती तपासा', query: 'नाशिकमध्ये टोमॅटोची किंमत काय आहे?', icon: TrendingUp },
      { label: 'हवामान अंदाज', query: 'या आठवड्यात पाऊस पडेल का?', icon: ThermometerSun },
      { label: 'कीड ओळखणे', query: 'माझ्या पानांवर तपकिरी ठिपके आहेत, हा कोणता रोग आहे?', icon: Bug },
    ] : [
      { label: 'ऑर्गेनिक कांदा खरेदी करा', query: 'मी नाशिकमध्ये सेंद्रिय कांदा कोठून खरेदी करू शकतो?', icon: Store },
      { label: 'गव्हाच्या किमतींचे कल', query: 'गव्हाच्या किमतींचे हंगामी कल काय आहेत?', icon: TrendingUp },
      { label: 'वितरण प्रक्रिया', query: 'अॅग्रीब्रिजवर डिलिव्हरी कशी ट्रॅक आणि व्यवस्थापित केली जाते?', icon: Truck },
    ],
  }
});

export function AIAssistant({ role }: { role: 'farmer' | 'buyer' }) {
  const { user } = useAuth();
  const [language, setLanguage] = useState<'en' | 'hi' | 'mr'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lang');
      if (saved === 'hi' || saved === 'mr' || saved === 'en') {
        return saved;
      }
    }
    return 'en';
  });

  const translations = getTranslations(role);
  const t = translations[language];

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
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

  const handleLanguageChange = (lang: 'en' | 'hi' | 'mr') => {
    setLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

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
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'ai',
        text: language === 'en' ? "I'm having trouble connecting to the network right now. Please try again later." : 
              language === 'hi' ? "मुझे अभी नेटवर्क से कनेक्ट करने में समस्या हो रही है। कृपया बाद में पुनः प्रयास करें।" :
              "मला आत्ता नेटवर्कशी कनेक्ट करण्यात अडचण येत आहे. कृपया नंतर पुन्हा प्रयत्न करा.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoice = async () => {
    setIsListening(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsListening(false);
    const query = language === 'en' ? "Will it rain this week?" : 
                  language === 'hi' ? "क्या इस सप्ताह बारिश होगी?" : 
                  "या आठवड्यात पाऊस पडेल का?";
    handleSend(query);
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
          {['en', 'hi', 'mr'].map((lang) => (
            <Badge 
              key={lang}
              variant="outline" 
              className={`cursor-pointer transition-colors ${language === lang ? 'bg-primary text-white border-primary' : 'bg-background text-muted-foreground'}`}
              onClick={() => handleLanguageChange(lang as 'en' | 'hi' | 'mr')}
            >
              {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
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
                className="flex items-center gap-3 p-4 rounded-xl glass-card border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
              >
                <div className="p-2 rounded-lg bg-secondary group-hover:bg-primary/20 text-foreground group-hover:text-primary transition-colors">
                  <SuggestionIcon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{suggestion.label}</span>
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
                <div className="px-4 py-4 rounded-2xl glass border border-border/50 bg-secondary/50 rounded-tl-sm flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input Area */}
          <div className="p-4 border-t border-border/50 bg-secondary/20 z-10">
            <div className="flex gap-2 max-w-4xl mx-auto relative">
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
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                placeholder={t.placeholder}
                className="h-12 bg-background border-border/50 rounded-xl pr-12 focus-visible:ring-primary/50 text-base"
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
            <div className="text-center mt-2 text-xs text-muted-foreground">
              {t.warning}
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
}
