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
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export default function KrishiSathiAIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Namaste! I am KrishiSathi, your personal AI farming assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // In a real implementation, we fetch from /api/ai/chat
      // We will simulate the same logic as the backend mock for immediate frontend UX
      await new Promise(r => setTimeout(r, 1200));
      
      let aiText = "I can assist you with real-time crop pricing, local weather patterns, and soil management.";
      if (text.toLowerCase().includes('price')) {
        aiText = "Based on current APMC data for your region, Tomato prices are trending upwards by 5%. Expected clearing price is ₹2,300/qtl.";
      } else if (text.toLowerCase().includes('rain') || text.toLowerCase().includes('weather')) {
        aiText = "Meteorological data suggests heavy rainfall in your district over the next 48 hours. It is advisable to delay any open-field harvesting.";
      } else if (text.toLowerCase().includes('disease') || text.toLowerCase().includes('leaf')) {
        aiText = "Yellowing leaves with brown spots on tomatoes often indicate Early Blight. Consider applying a copper-based fungicide and improving air circulation around the plants.";
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiText,
        timestamp: new Date()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "I'm having trouble connecting to the network right now. Please try again later.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoice = async () => {
    setIsListening(true);
    // Mock Voice recognition delay
    await new Promise(r => setTimeout(r, 2500));
    setIsListening(false);
    handleSend("What is the current market price for tomatoes?");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto gap-6">
      
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" /> KrishiSathi AI
          </h1>
          <p className="text-muted-foreground">Powered by Groq</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-background">English</Badge>
          <Badge variant="outline" className="bg-background text-muted-foreground">हिंदी</Badge>
          <Badge variant="outline" className="bg-background text-muted-foreground">मराठी</Badge>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Quick Prompts Sidebar */}
        <div className="hidden lg:flex w-64 flex-col gap-4 overflow-y-auto shrink-0">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Suggested Queries</h3>
          
          {[
            { label: 'Check Crop Prices', query: 'What is the price of Tomatoes in Nashik?', icon: TrendingUp },
            { label: 'Weather Forecast', query: 'Will it rain this week?', icon: ThermometerSun },
            { label: 'Pest Identification', query: 'My leaves have brown spots, what disease is it?', icon: Bug },
          ].map((suggestion, i) => (
            <button
              key={i}
              onClick={() => handleSend(suggestion.query)}
              className="flex items-center gap-3 p-4 rounded-xl glass-card border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
            >
              <div className="p-2 rounded-lg bg-secondary group-hover:bg-primary/20 text-foreground group-hover:text-primary transition-colors">
                <suggestion.icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{suggestion.label}</span>
            </button>
          ))}
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
                      <AvatarFallback className="bg-secondary">FM</AvatarFallback>
                    )}
                  </Avatar>
                  <div className={`flex flex-col gap-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-3 rounded-2xl ${
                      msg.sender === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                        : 'glass border border-border/50 bg-secondary/50 rounded-tl-sm text-foreground'
                    }`}>
                      <p className="text-[15px] leading-relaxed">{msg.text}</p>
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
                title="Speak to KrishiSathi"
              >
                {isListening ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
              </Button>
              
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                placeholder="Ask about crop prices, weather, or farming advice..."
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
              KrishiSathi AI can make mistakes. Consider verifying critical information.
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
}
