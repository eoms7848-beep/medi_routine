import React, { useState } from 'react';
import {
  Sun,
  SunMedium,
  Moon,
  Bed,
  Check,
  Plus,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Flame,
  HelpCircle,
} from 'lucide-react';
import { MedicationItem, TimingSlot } from '../types/medication';

interface RoutineChecklistProps {
  medications: MedicationItem[];
  routineState: Record<string, boolean>;
  onToggleRoutine: (slot: TimingSlot, medId: string) => void;
  onOpenAddModal: () => void;
  onSelectMedication: (med: MedicationItem) => void;
  onGoToInteraction: () => void;
  todayDateStr: string;
}

interface SlotMeta {
  slot: TimingSlot;
  label: string;
  timeRange: string;
  subText: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgLight: string;
  borderLight: string;
}

const SLOTS: SlotMeta[] = [
  {
    slot: 'morning',
    label: '아침',
    timeRange: '07:00 ~ 09:30',
    subText: '아침 식사 전후',
    icon: Sun,
    accentColor: 'text-amber-500',
    bgLight: 'bg-amber-50/60',
    borderLight: 'border-amber-100',
  },
  {
    slot: 'lunch',
    label: '점심',
    timeRange: '12:00 ~ 13:30',
    subText: '점심 식사 전후',
    icon: SunMedium,
    accentColor: 'text-orange-500',
    bgLight: 'bg-orange-50/60',
    borderLight: 'border-orange-100',
  },
  {
    slot: 'dinner',
    label: '저녁',
    timeRange: '18:00 ~ 19:30',
    subText: '저녁 식사 전후',
    icon: Moon,
    accentColor: 'text-indigo-500',
    bgLight: 'bg-indigo-50/60',
    borderLight: 'border-indigo-100',
  },
  {
    slot: 'bedtime',
    label: '취침 전',
    timeRange: '22:00 ~ 23:30',
    subText: '잠들기 30분 전',
    icon: Bed,
    accentColor: 'text-purple-500',
    bgLight: 'bg-purple-50/60',
    borderLight: 'border-purple-100',
  },
];

export const RoutineChecklist: React.FC<RoutineChecklistProps> = ({
  medications,
  routineState,
  onToggleRoutine,
  onOpenAddModal,
  onSelectMedication,
  onGoToInteraction,
  todayDateStr,
}) => {
  const [selectedFilterSlot, setSelectedFilterSlot] = useState<TimingSlot | 'all'>('all');

  // Helper to get key
  const getKey = (slot: TimingSlot, medId: string) => `${todayDateStr}_${slot}_${medId}`;

  // Filter slots to display
  const displaySlots = selectedFilterSlot === 'all'
    ? SLOTS
    : SLOTS.filter((s) => s.slot === selectedFilterSlot);

  // Quick stats
  let totalTasks = 0;
  let completedTasks = 0;
  SLOTS.forEach((slotInfo) => {
    const medsForSlot = medications.filter((m) => m.timings.includes(slotInfo.slot));
    medsForSlot.forEach((m) => {
      totalTasks++;
      if (routineState[getKey(slotInfo.slot, m.id)]) {
        completedTasks++;
      }
    });
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Toss-style greeting card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                TODAY ROUTINE
              </span>
              <span className="text-xs text-slate-400">4분할 타임라인 케어</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              오늘 복약할 약물이{' '}
              <span className="text-blue-600 underline decoration-blue-200 decoration-wavy">
                {totalTasks - completedTasks}개
              </span>{' '}
              남았어요
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              정확한 시간에 복용하고, 간과 위장에 무리가 가지 않도록 안전 가이드를 확인하세요.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-bold px-4 py-3 rounded-2xl shadow-sm shadow-blue-500/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>약 추가하기</span>
            </button>
          </div>
        </div>

        {/* Warning banner teaser */}
        <div
          onClick={onGoToInteraction}
          className="mt-4 bg-amber-50/80 hover:bg-amber-100/70 border border-amber-200/60 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="text-xs sm:text-sm">
              <span className="font-bold text-amber-900">약물-음식 상호작용 주의보: </span>
              <span className="text-amber-800">
                알코올 24h 완전 금지 · 카페인 및 유제품 2시간 간격 권장
              </span>
            </div>
          </div>
          <div className="flex items-center text-xs font-bold text-amber-700 group-hover:translate-x-0.5 transition-transform">
            <span>자세히 보기</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs for 4-slot Timeline */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSelectedFilterSlot('all')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            selectedFilterSlot === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          전체 하루 ({totalTasks})
        </button>
        {SLOTS.map((s) => {
          const count = medications.filter((m) => m.timings.includes(s.slot)).length;
          const Icon = s.icon;
          const isSelected = selectedFilterSlot === s.slot;
          return (
            <button
              key={s.slot}
              onClick={() => setSelectedFilterSlot(s.slot)}
              className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${s.accentColor}`} />
              <span>{s.label}</span>
              <span className="text-[11px] opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* 4 Time Slots List */}
      <div className="space-y-6">
        {displaySlots.map((slotInfo) => {
          const slotMeds = medications.filter((m) => m.timings.includes(slotInfo.slot));
          const slotCompleted = slotMeds.filter((m) => routineState[getKey(slotInfo.slot, m.id)]).length;
          const isAllDone = slotMeds.length > 0 && slotCompleted === slotMeds.length;
          const Icon = slotInfo.icon;

          return (
            <section
              key={slotInfo.slot}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs transition-all hover:border-slate-200"
            >
              {/* Slot Header */}
              <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl ${slotInfo.bgLight} border ${slotInfo.borderLight} flex items-center justify-center ${slotInfo.accentColor}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-black text-slate-900">
                        {slotInfo.label} 복약
                      </h2>
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {slotInfo.timeRange}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{slotInfo.subText}</p>
                  </div>
                </div>

                {/* Progress Pill / All done status */}
                <div className="flex items-center gap-2">
                  {slotMeds.length > 0 && (
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        isAllDone
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isAllDone ? '모두 복용 완료 ✓' : `${slotCompleted}/${slotMeds.length} 완료`}
                    </span>
                  )}
                </div>
              </div>

              {/* Medication items in this slot */}
              {slotMeds.length === 0 ? (
                <div className="py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs sm:text-sm text-slate-400 font-medium">
                    {slotInfo.label}에 복용하도록 지정된 약물이 없습니다.
                  </p>
                  <button
                    onClick={onOpenAddModal}
                    className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-700 underline"
                  >
                    약물 추가하기
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {slotMeds.map((med) => {
                    const isChecked = Boolean(routineState[getKey(slotInfo.slot, med.id)]);

                    return (
                      <div
                        key={med.id}
                        className={`group relative rounded-2xl p-3.5 sm:p-4 border transition-all ${
                          isChecked
                            ? 'bg-slate-50/80 border-slate-200/80 opacity-75'
                            : 'bg-white hover:bg-slate-50/40 border-slate-100 hover:border-slate-200 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          {/* Toss Style Checkbox */}
                          <button
                            onClick={() => onToggleRoutine(slotInfo.slot, med.id)}
                            className={`mt-0.5 w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                              isChecked
                                ? 'bg-blue-600 text-white shadow-xs scale-100'
                                : 'border-2 border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/30'
                            }`}
                            aria-label={`${med.name} 복약 체크`}
                          >
                            {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                          </button>

                          {/* Med Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                onClick={() => onSelectMedication(med)}
                                className={`text-sm sm:text-base font-bold cursor-pointer hover:text-blue-600 transition-colors ${
                                  isChecked ? 'line-through text-slate-400' : 'text-slate-900'
                                }`}
                              >
                                {med.name}
                              </span>

                              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                {med.dosage}
                              </span>

                              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                {med.category}
                              </span>
                            </div>

                            {/* Timing guideline badge */}
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="text-xs font-semibold text-slate-600 bg-slate-100/80 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {med.intakeTimingText}
                              </span>

                              {/* Organ warning badges */}
                              {med.liverBurden === 'high' && (
                                <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                  <Flame className="w-3 h-3 text-rose-500" />
                                  간 주의 (음주 절대 금지)
                                </span>
                              )}
                              {med.stomachBurden === 'high' && (
                                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                                  위장 주의 (식후 필수)
                                </span>
                              )}
                            </div>

                            {/* Food warnings inline */}
                            {med.avoidFoods && med.avoidFoods.length > 0 && (
                              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                                {med.avoidFoods.map((f, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md"
                                  >
                                    🚫 {f.food}: <strong className="text-slate-700">{f.gracePeriod}</strong>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Quick detail trigger */}
                          <button
                            onClick={() => onSelectMedication(med)}
                            className="p-1.5 text-slate-300 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="상세 정보"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Floating Add Card at Bottom for Mobile Comfort */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-5 text-white shadow-lg shadow-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base">새로운 처방전이나 영양제가 생겼나요?</h3>
            <p className="text-xs text-blue-100">
              사진 한 장으로 성분을 자동 인식하고 4분할 루틴에 즉시 등록해 드려요.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenAddModal}
          className="w-full sm:w-auto bg-white hover:bg-blue-50 active:scale-95 text-blue-600 font-bold text-sm px-5 py-3 rounded-2xl shadow-sm transition-all cursor-pointer whitespace-nowrap"
        >
          AI로 사진 등록하기
        </button>
      </div>
    </div>
  );
};
