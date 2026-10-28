import React from 'react';
import { Pill, ShieldAlert, Sparkles, MessageSquareHeart, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'routine' | 'analysis' | 'interaction' | 'chat';
  setActiveTab: (tab: 'routine' | 'analysis' | 'interaction' | 'chat') => void;
  completedCount: number;
  totalCount: number;
  todayDateStr: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  completedCount,
  totalCount,
  todayDateStr,
}) => {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Top brand & status bar */}
        <div className="flex items-center justify-between py-3.5 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">메디루틴 AI</span>
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  Gemini Flash 3.8
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">{todayDateStr}</p>
            </div>
          </div>

          {/* Daily completion badge */}
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-2xl">
            <div className="relative w-7 h-7 flex items-center justify-center">
              <svg className="w-7 h-7 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`${percentage === 100 ? 'text-emerald-500' : 'text-blue-600'} transition-all duration-500`}
                  strokeDasharray={`${percentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-slate-700">{percentage}%</span>
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-[11px] font-medium text-slate-400">오늘의 복약률</div>
              <div className="text-xs font-bold text-slate-800">
                {completedCount}/{totalCount} 완료
              </div>
            </div>
          </div>
        </div>

        {/* Toss-style clean navigation tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 py-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('routine')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'routine'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>복약 루틴</span>
            {totalCount > 0 && (
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'routine' ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-700'
                }`}
              >
                {completedCount}/{totalCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'analysis'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI 성분 등록</span>
          </button>

          <button
            onClick={() => setActiveTab('interaction')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'interaction'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>간·위장 & 상호작용</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <MessageSquareHeart className="w-4 h-4 text-rose-500" />
            <span>AI 약사 상담</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
