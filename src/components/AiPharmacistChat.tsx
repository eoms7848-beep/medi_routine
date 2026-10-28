import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
  AlertCircle,
  HelpCircle,
  Pill,
  ChevronRight,
  ShieldAlert,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { ChatMessage, MedicationItem } from '../types/medication';

interface AiPharmacistChatProps {
  medications: MedicationItem[];
  initialQuery?: string;
}

export const AiPharmacistChat: React.FC<AiPharmacistChatProps> = ({
  medications,
  initialQuery,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      content: `안녕하세요! **메디루틴 AI 전담 약사**입니다 💊✨

현재 등록해 주신 **${medications.length}종의 복약 정보**를 바탕으로 실시간 맞춤 복약 상담을 도와드리고 있습니다.

- 특정 약을 복용하고 커피나 술을 언제 마실 수 있는지
- 약 먹고 속이 쓰릴 때 대처하는 법
- 영양제와 처방약의 상호작용 및 최적 섭취 순서

어떤 점이 가장 궁금하신가요?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState(initialQuery || '');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialQuery) {
      setInputText(initialQuery);
    }
  }, [initialQuery]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend !== undefined ? textToSend : inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      // Send conversation history to backend Gemini 3.8 Flash endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          currentMedications: medications,
        }),
      });

      if (!response.ok) {
        throw new Error('약사 AI의 응답을 받아오지 못했습니다.');
      }

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: data.text || '답변을 생성하지 못했습니다. 다시 질문해 주세요.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `⚠️ 일시적인 통신 문제가 발생했습니다: ${err.message || '다시 시도해 주세요.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        content: `대화가 초기화되었습니다. 현재 등록된 **${medications.length}개의 약물/영양제**를 기준으로 무엇이든 편하게 물어보세요!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Quick inquiry prompts
  const SUGGESTED_PROMPTS = [
    '☕ 약 먹고 아메리카노 언제 마실 수 있나요?',
    '🍺 타이레놀 먹었는데 오늘 맥주 마시면 안 되나요?',
    '🥛 항생제와 우유/요거트 같이 먹으면 왜 안 좋죠?',
    '💊 오메가3와 마그네슘은 언제 먹는 게 가장 좋나요?',
    '🤢 약 먹고 속이 너무 쓰린데 어떻게 해야 하죠?',
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[75vh] max-h-[780px]">
      {/* Chat Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-slate-900 text-sm sm:text-base">메디루틴 전담 약사 AI</h2>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-400">
              현재 내 복약 목록 {medications.length}종 연동 중 · 실시간 상호작용 검토
            </p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="text-xs text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-200/50 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
          title="대화 초기화"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">대화 비우기</span>
        </button>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/30">
        {messages.map((msg) => {
          const isBot = msg.role === 'model';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
            >
              {isBot && (
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isBot
                    ? 'bg-white border border-slate-100 shadow-2xs text-slate-800'
                    : 'bg-blue-600 text-white shadow-xs rounded-br-sm'
                }`}
              >
                {/* Message Content with basic Markdown formatting */}
                <div className="space-y-2 whitespace-pre-wrap">
                  {msg.content.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx}>
                      {paragraph.split('\n').map((line, lIdx) => {
                        // Check if bullet
                        const isBullet = line.trim().startsWith('- ');
                        const lineContent = isBullet ? line.trim().slice(2) : line;

                        return (
                          <span key={lIdx} className={isBullet ? 'block pl-3 relative before:content-["•"] before:absolute before:left-0 before:text-blue-500' : 'block'}>
                            {lineContent}
                          </span>
                        );
                      })}
                    </p>
                  ))}
                </div>

                <div
                  className={`text-[10px] mt-2 font-medium ${
                    isBot ? 'text-slate-400 text-right' : 'text-blue-200 text-right'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {!isBot && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-2xs mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-2xs flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>약사 AI가 내 복약 데이터를 분석해 답변을 작성하고 있습니다...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-4 py-2 border-t border-slate-100 bg-white overflow-x-auto no-scrollbar flex items-center gap-2">
        <span className="text-[11px] font-bold text-slate-400 shrink-0">추천 질문:</span>
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(prompt.replace(/^[^\s]+\s*/, ''))}
            className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer border border-transparent hover:border-blue-200"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 sm:p-4 border-t border-slate-100 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="약물 복용법, 부작용, 커피·음식 유예시간에 대해 편하게 물어보세요..."
            disabled={isLoading}
            className="flex-1 text-xs sm:text-sm py-3 px-4 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="w-11 h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-2xl flex items-center justify-center shadow-xs transition-all cursor-pointer shrink-0"
            title="메시지 전송"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
};
