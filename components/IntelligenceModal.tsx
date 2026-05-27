import React, { useState, useEffect, useRef } from 'react';
// Fix: Added missing geminiService import path verification
import { getDashboardInsights, chatWithDashboard } from '../services/geminiService.ts';
import { apiService, apiStatus } from '../services/apiService.ts';
import { Sparkles, X, Loader2, Database, WifiOff, Send, MessageSquare, Bot, User, CornerDownLeft, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  "Berapakah anggaran hasil cukai terkumpul?",
  "Negeri manakah yang mengutip cukai tertinggi?",
  "Berapakah purata hari kenderaan disimpan di gudang?",
  "Adakah terdapat amaran AP yang kritikal?"
];

// Web Speech APIs setup
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const IntelligenceModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dataMode, setDataMode] = useState<'live' | 'cached'>('live');
  
  // Voice States
  const [isListening, setIsListening] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setDataMode(apiStatus.isLive ? 'live' : 'cached');
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          text: 'Selamat datang! Saya adalah Pembantu Pintar AI MyPEKEMA. Saya sedia membantu tuan/puan menganalisis data gudang, unjuran cukai, dan status AP secara masa nyata.\n\nSila tanya saya sebarang soalan mengenai inventori gudang atau sebut arahan anda menggunakan butang mikrofon.',
          timestamp: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [isOpen]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'ms-MY';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputVal(transcript);
      };

      rec.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Ciri arahan suara tidak disokong oleh pelayar anda.");
      return;
    }
    
    // Stop speaking if playing
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsPlayingVoice(null);
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const speakText = (text: string, msgId: string) => {
    if ('speechSynthesis' in window) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        if (isPlayingVoice === msgId) {
          setIsPlayingVoice(null);
          return;
        }
      }

      // Clean text from markdown characters for a cleaner audio read
      const cleanText = text.replace(/[*#\-\u2022]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ms-MY';

      // Find local Southeast Asian voice if available
      const voices = window.speechSynthesis.getVoices();
      const localized = voices.find(v => v.lang.startsWith('ms') || v.lang.startsWith('id'));
      if (localized) {
        utterance.voice = localized;
      }

      utterance.onend = () => {
        setIsPlayingVoice(null);
      };

      utterance.onerror = () => {
        setIsPlayingVoice(null);
      };

      setIsPlayingVoice(msgId);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Pembacaan suara tidak disokong oleh pelayar anda.");
    }
  };

  // Close voices on modal close
  const handleClose = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingVoice(null);
    onClose();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      role: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    try {
      const [stats, dominance, taxAnalysis] = await Promise.all([
        apiService.getSummaryStats(),
        apiService.getDominanceData(),
        apiService.getTaxAnalysis()
      ]);

      const dataContext = {
        stats,
        dominance,
        taxAnalysis,
        mode: apiStatus.isLive ? 'LIVE DATABASE' : 'CACHED REFRESH'
      };

      const chatHistory = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

      const reply = await chatWithDashboard(text, chatHistory, dataContext);

      const aiMsg: Message = {
        id: Math.random().toString(),
        role: 'model',
        text: reply || 'Maaf, tiada maklum balas daripada AI.',
        timestamp: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errMsg: Message = {
        id: Math.random().toString(),
        role: 'model',
        text: 'Ralat: Gagal menghubungi AI. Sila semak sambungan rangkaian anda.',
        timestamp: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 print:hidden">
      
      {/* Inject Voice Pulse CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes audio-pulse {
          0% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.4); opacity: 0.1; }
          100% { transform: scale(1); opacity: 0.4; }
        }
        .audio-pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 9999px;
          background-color: #ef4444;
          animation: audio-pulse 1.8s infinite ease-in-out;
        }
      `}} />

      <div className="bg-slate-950/40 border border-white/10 backdrop-blur-2xl w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col h-[80vh] max-h-[700px] overflow-hidden animate-in zoom-in duration-300">
        
        {/* Header Section */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-slate-900 to-indigo-950 text-white relative">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Sparkles className="w-24 h-24 text-indigo-400" />
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="bg-indigo-600/30 p-2 rounded-2xl border border-indigo-500/25">
              <Sparkles className="w-5 h-5 text-indigo-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.25em] italic">Command AI Center</h2>
              <div className="flex items-center gap-1.5 mt-0.5 opacity-80">
                {dataMode === 'live' ? <Database className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-amber-400" />}
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-300">Sembang AI • Mod {dataMode === 'live' ? 'Data Langsung' : 'Cached'}</p>
              </div>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full transition-all text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conversation Thread Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/20">
          {messages.map((m) => {
            const isAI = m.role === 'model';
            const isSpeaking = isPlayingVoice === m.id;
            return (
              <div key={m.id} className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}>
                {isAI && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4.5 h-4.5 text-indigo-400" />
                  </div>
                )}
                
                <div className={`max-w-[75%] rounded-[1.5rem] px-5 py-3 text-xs leading-relaxed relative group ${
                  isAI 
                    ? 'bg-slate-900/60 border border-white/5 text-slate-200 rounded-tl-sm' 
                    : 'bg-indigo-600 text-white rounded-tr-sm shadow-lg shadow-indigo-600/10'
                }`}>
                  <div className="whitespace-pre-wrap font-medium pr-6">
                    {m.text.split('\n').map((line, idx) => {
                      if (line.startsWith('* ') || line.startsWith('- ')) {
                        return (
                          <div key={idx} className="flex gap-1.5 mt-1 ml-1">
                            <span className={isAI ? 'text-indigo-400' : 'text-indigo-200'}>•</span>
                            <span>{line.substring(2)}</span>
                          </div>
                        );
                      }
                      return <p key={idx} className={idx > 0 ? "mt-1.5" : ""}>{line}</p>;
                    })}
                  </div>
                  
                  {/* TTS Voice Speaker button inside AI response bubble */}
                  {isAI && (
                    <button 
                      onClick={() => speakText(m.text, m.id)}
                      className={`absolute right-3.5 top-3.5 p-1 rounded-md transition-all ${
                        isSpeaking ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title="Sebut Jawapan AI"
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  )}

                  <p className={`text-[8px] font-bold text-right mt-1.5 uppercase ${isAI ? 'text-slate-500' : 'text-indigo-200'}`}>
                    {m.timestamp}
                  </p>
                </div>

                {!isAI && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-md">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Bot className="w-4.5 h-4.5 text-indigo-400 animate-bounce" />
              </div>
              <div className="bg-slate-900/60 border border-white/5 text-slate-200 rounded-[1.5rem] rounded-tl-sm px-5 py-3.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Container */}
        <div className="p-4 border-t border-white/5 bg-slate-950/30 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              disabled={isTyping}
              onClick={() => handleSendMessage(prompt)}
              className="bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar Area with Mic */}
        <div className="p-6 border-t border-white/10 bg-slate-950/40">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputVal); }}
            className="flex gap-3 relative"
          >
            {/* Mic trigger button */}
            <div className="relative w-12 h-12 flex-shrink-0">
              {isListening && <div className="audio-pulse-ring"></div>}
              <button 
                type="button"
                onClick={toggleListening}
                className={`w-full h-full rounded-2xl flex items-center justify-center border transition-all ${
                  isListening 
                    ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/30' 
                    : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={isListening ? "Hentikan Rakaman Arahan" : "Sebut Arahan Anda"}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>

            <input 
              type="text" 
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={isTyping}
              placeholder={isListening ? "Mendengar suara anda..." : "Tanya AI tentang Inventori & Cukai..."}
              className="flex-1 bg-slate-900/80 border border-white/10 rounded-2xl pl-4 pr-12 py-3.5 text-xs text-white placeholder-slate-500 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
            <button 
              type="submit"
              disabled={!inputVal.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/25 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};