import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { RoutineChecklist } from './components/RoutineChecklist';
import { AiAnalysisModal } from './components/AiAnalysisModal';
import { InteractionGuide } from './components/InteractionGuide';
import { AiPharmacistChat } from './components/AiPharmacistChat';
import { MedicationDetailModal } from './components/MedicationDetailModal';
import { MedicationItem, TimingSlot } from './types/medication';
import { INITIAL_MEDICATIONS } from './data/initialMedications';
import {
  MessageSquareHeart,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';

const STORAGE_KEY_MEDS = 'mediroutine_medications_v1';
const STORAGE_KEY_ROUTINE = 'mediroutine_routine_v2';

export default function App() {
  const [activeTab, setActiveTab] = useState<'routine' | 'analysis' | 'interaction' | 'chat'>('routine');

  // Today Date Calculation
  const today = new Date();
  const todayDateStr = today.toISOString().split('T')[0];

  // Selected Date state (defaults to today)
  const [selectedDate, setSelectedDate] = useState<string>(todayDateStr);

  const [medications, setMedications] = useState<MedicationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MEDS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_MEDICATIONS;
  });

  const [routineState, setRoutineState] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROUTINE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }

    // Default pre-checked state with today and past days seed data
    const d1 = new Date(); d1.setDate(d1.getDate() - 1); const yesterday = d1.toISOString().split('T')[0];
    const d2 = new Date(); d2.setDate(d2.getDate() - 2); const twoDaysAgo = d2.toISOString().split('T')[0];
    const d3 = new Date(); d3.setDate(d3.getDate() - 3); const threeDaysAgo = d3.toISOString().split('T')[0];

    return {
      // Today: partial morning complete
      [`${todayDateStr}_morning_med-tylenol-500`]: true,
      [`${todayDateStr}_morning_med-rtg-omega3`]: true,

      // Yesterday: 100% completed day
      [`${yesterday}_morning_med-tylenol-500`]: true,
      [`${yesterday}_morning_med-rtg-omega3`]: true,
      [`${yesterday}_lunch_med-ezn6-eve`]: true,
      [`${yesterday}_dinner_med-tylenol-500`]: true,
      [`${yesterday}_dinner_med-clavixin-amoxicillin`]: true,
      [`${yesterday}_bedtime_med-magnesium-sleep`]: true,

      // 2 days ago: partial completed
      [`${twoDaysAgo}_morning_med-tylenol-500`]: true,
      [`${twoDaysAgo}_morning_med-rtg-omega3`]: true,
      [`${twoDaysAgo}_dinner_med-tylenol-500`]: true,
      [`${twoDaysAgo}_bedtime_med-magnesium-sleep`]: true,

      // 3 days ago: 100% completed
      [`${threeDaysAgo}_morning_med-tylenol-500`]: true,
      [`${threeDaysAgo}_morning_med-rtg-omega3`]: true,
      [`${threeDaysAgo}_lunch_med-ezn6-eve`]: true,
      [`${threeDaysAgo}_dinner_med-tylenol-500`]: true,
      [`${threeDaysAgo}_bedtime_med-magnesium-sleep`]: true,
    };
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<MedicationItem | null>(null);
  const [chatInitialQuery, setChatInitialQuery] = useState<string | undefined>(undefined);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MEDS, JSON.stringify(medications));
    } catch (e) {
      console.error(e);
    }
  }, [medications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ROUTINE, JSON.stringify(routineState));
    } catch (e) {
      console.error(e);
    }
  }, [routineState]);

  // Formatted date string for selected date
  const selectedDateFormatted = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  }, [selectedDate]);

  // Toggle routine checkbox for target date
  const handleToggleRoutine = (slot: TimingSlot, medId: string, targetDateStr?: string) => {
    const dateToUse = targetDateStr || selectedDate;
    const key = `${dateToUse}_${slot}_${medId}`;
    setRoutineState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Add new medications from AI Analysis
  const handleAddMedications = (newMeds: MedicationItem[]) => {
    setMedications((prev) => [...prev, ...newMeds]);
    setActiveTab('routine');
  };

  // Delete medication
  const handleDeleteMedication = (id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
  };

  // Calculate completion for selected date
  let totalTasks = 0;
  let completedTasks = 0;
  const SLOTS: TimingSlot[] = ['morning', 'lunch', 'dinner', 'bedtime'];
  SLOTS.forEach((slot) => {
    const medsForSlot = medications.filter((m) => m.timings.includes(slot));
    medsForSlot.forEach((m) => {
      totalTasks++;
      if (routineState[`${selectedDate}_${slot}_${m.id}`]) {
        completedTasks++;
      }
    });
  });

  const handleOpenChatWithQuery = (query: string) => {
    setChatInitialQuery(query);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-700">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        completedCount={completedTasks}
        totalCount={totalTasks}
        todayDateStr={selectedDateFormatted}
        isToday={selectedDate === todayDateStr}
        onSelectToday={() => setSelectedDate(todayDateStr)}
      />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        {activeTab === 'routine' && (
          <RoutineChecklist
            medications={medications}
            routineState={routineState}
            onToggleRoutine={handleToggleRoutine}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onSelectMedication={(med) => setSelectedMedication(med)}
            onGoToInteraction={() => setActiveTab('interaction')}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            todayDateStr={todayDateStr}
          />
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6 pb-20">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI INGREDIENT REGISTRATION
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">AI 성분 분석 및 자동 등록</h1>
              <p className="text-sm text-slate-500 mt-1">
                병원 처방전이나 영양제 라벨을 촬영하면 Gemini 3.8 Flash가 주요 성분을 정밀 분석하여
                4분할 타임라인 루틴과 간·위장 안전 규칙을 자동으로 생성해 드립니다.
              </p>
            </div>

            {/* Embedded Modal Trigger or View */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">새로운 처방전 및 영양제 분석 열기</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
                  사진 촬영 또는 텍스트 검색을 통해 1초 만에 약학 데이터베이스와 매칭합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-sm shadow-blue-500/25 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>AI 성분 분석 창 열기</span>
              </button>
            </div>

            {/* Currently registered medications summary */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
              <h3 className="font-black text-base text-slate-900">
                현재 등록된 약물 및 영양제 목록 ({medications.length}종)
              </h3>
              <div className="divide-y divide-slate-100">
                {medications.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMedication(m)}
                    className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50/60 px-2 rounded-xl transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm text-slate-900">{m.name}</strong>
                        <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          {m.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        복용: {m.intakeTimingText} · {(m.timings || []).join(', ')}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-400">상세보기 →</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'interaction' && (
          <InteractionGuide
            medications={medications}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenChatWithQuery={handleOpenChatWithQuery}
          />
        )}

        {activeTab === 'chat' && (
          <div className="space-y-4 pb-20">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <MessageSquareHeart className="w-3.5 h-3.5 text-rose-500" />
                  PHARMACIST CONSULTANT
                </span>
                <span className="text-xs text-slate-400">Gemini 3.8 Flash</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                전담 약사 AI 1:1 맞춤 복약 상담
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                등록된 약물과 음식의 상호작용, 부작용 시 대처 요령, 커피나 음주 후 안전한 복약 간격을 편안하게 물어보세요.
              </p>
            </div>

            <AiPharmacistChat
              medications={medications}
              initialQuery={chatInitialQuery}
            />
          </div>
        )}
      </main>

      {/* Quick Floating Chatbot Button (when not on chat tab) */}
      {activeTab !== 'chat' && (
        <button
          onClick={() => setActiveTab('chat')}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-lg shadow-blue-500/30 flex items-center gap-2.5 transition-all cursor-pointer group"
          aria-label="약사 AI 상담"
        >
          <div className="relative">
            <MessageSquareHeart className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-400 rounded-full animate-ping" />
          </div>
          <span className="hidden sm:inline text-xs sm:text-sm font-bold tracking-tight">
            약사 AI에게 물어보기
          </span>
        </button>
      )}

      {/* AI Analysis Modal */}
      <AiAnalysisModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddMedications={handleAddMedications}
      />

      {/* Medication Detail Modal */}
      <MedicationDetailModal
        medication={selectedMedication}
        onClose={() => setSelectedMedication(null)}
        onDelete={handleDeleteMedication}
      />
    </div>
  );
}
