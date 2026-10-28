import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  Calendar,
  CalendarDays,
  ChevronLeft,
  RotateCcw,
  CheckCheck,
} from 'lucide-react';
import { MedicationItem, TimingSlot } from '../types/medication';

interface RoutineChecklistProps {
  medications: MedicationItem[];
  routineState: Record<string, boolean>;
  onToggleRoutine: (slot: TimingSlot, medId: string, targetDateStr?: string) => void;
  onOpenAddModal: () => void;
  onSelectMedication: (med: MedicationItem) => void;
  onGoToInteraction: () => void;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
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

const WEEKDAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export const RoutineChecklist: React.FC<RoutineChecklistProps> = ({
  medications,
  routineState,
  onToggleRoutine,
  onOpenAddModal,
  onSelectMedication,
  onGoToInteraction,
  selectedDate,
  onSelectDate,
  todayDateStr,
}) => {
  const [selectedFilterSlot, setSelectedFilterSlot] = useState<TimingSlot | 'all'>('all');
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const dateScrollRef = useRef<HTMLDivElement>(null);

  // Helper to format key
  const getKey = (slot: TimingSlot, medId: string) => `${selectedDate}_${slot}_${medId}`;

  // Check if viewing today, past, or future
  const isToday = selectedDate === todayDateStr;
  const isPast = selectedDate < todayDateStr;
  const isFuture = selectedDate > todayDateStr;

  // Selected date formatted text
  const selectedDateObj = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [selectedDate]);

  const selectedDateFormatted = useMemo(() => {
    const m = selectedDateObj.getMonth() + 1;
    const d = selectedDateObj.getDate();
    const day = WEEKDAY_NAMES[selectedDateObj.getDay()];
    return `${m}월 ${d}일 (${day})`;
  }, [selectedDateObj]);

  // Generate 14 past days to 2 future days
  const dateStripList = useMemo(() => {
    const list: Array<{
      dateStr: string;
      dayNum: number;
      dayName: string;
      isToday: boolean;
      completionRate: number;
      isFull: boolean;
      hasAny: boolean;
    }> = [];

    const [todayY, todayM, todayD] = todayDateStr.split('-').map(Number);
    const base = new Date(todayY, todayM - 1, todayD);

    // Range: -10 days to +2 days
    for (let offset = -10; offset <= 2; offset++) {
      const d = new Date(base);
      d.setDate(base.getDate() + offset);
      const yStr = d.getFullYear();
      const mStr = String(d.getMonth() + 1).padStart(2, '0');
      const dStr = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yStr}-${mStr}-${dStr}`;

      // Calculate adherence for this date
      let total = 0;
      let completed = 0;
      SLOTS.forEach((slotInfo) => {
        const slotMeds = medications.filter((m) => m.timings.includes(slotInfo.slot));
        slotMeds.forEach((m) => {
          total++;
          if (routineState[`${dateStr}_${slotInfo.slot}_${m.id}`]) {
            completed++;
          }
        });
      });

      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      list.push({
        dateStr,
        dayNum: d.getDate(),
        dayName: WEEKDAY_NAMES[d.getDay()],
        isToday: dateStr === todayDateStr,
        completionRate: rate,
        isFull: total > 0 && completed === total,
        hasAny: completed > 0,
      });
    }

    return list;
  }, [todayDateStr, medications, routineState]);

  // Auto-scroll selected date into view in horizontal strip
  useEffect(() => {
    const activeEl = dateScrollRef.current?.querySelector('[data-selected="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedDate]);

  // Filter slots to display
  const displaySlots = selectedFilterSlot === 'all'
    ? SLOTS
    : SLOTS.filter((s) => s.slot === selectedFilterSlot);

  // Stats for the SELECTED date
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

  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Batch mark all for the selected date
  const handleMarkAllDone = () => {
    SLOTS.forEach((slotInfo) => {
      const medsForSlot = medications.filter((m) => m.timings.includes(slotInfo.slot));
      medsForSlot.forEach((m) => {
        if (!routineState[getKey(slotInfo.slot, m.id)]) {
          onToggleRoutine(slotInfo.slot, m.id, selectedDate);
        }
      });
    });
  };

  const handleClearAllDone = () => {
    SLOTS.forEach((slotInfo) => {
      const medsForSlot = medications.filter((m) => m.timings.includes(slotInfo.slot));
      medsForSlot.forEach((m) => {
        if (routineState[getKey(slotInfo.slot, m.id)]) {
          onToggleRoutine(slotInfo.slot, m.id, selectedDate);
        }
      });
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Date Selection Strip & Calendar Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm space-y-3">
        {/* Date Controls Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block">복약 일자 선택</span>
              <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
                <span>{selectedDateFormatted}</span>
                {isToday && (
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    오늘
                  </span>
                )}
                {isPast && (
                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                    과거 기록
                  </span>
                )}
                {isFuture && (
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    미래 예정
                  </span>
                )}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Go to Today Button */}
            {!isToday && (
              <button
                onClick={() => onSelectDate(todayDateStr)}
                className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>오늘로 이동</span>
              </button>
            )}

            {/* Native Date Picker trigger */}
            <label className="relative flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-xl transition-colors cursor-pointer">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>날짜 직접 지정</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) onSelectDate(e.target.value);
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </label>

            {/* Monthly Calendar View Modal Trigger */}
            <button
              onClick={() => setIsCalendarModalOpen(true)}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
              title="월간 복약 달력 보기"
            >
              달력 보기
            </button>
          </div>
        </div>

        {/* Horizontal Date Carousel (Toss Style) */}
        <div
          ref={dateScrollRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-0.5"
        >
          {dateStripList.map((item) => {
            const isSelected = item.dateStr === selectedDate;

            return (
              <button
                key={item.dateStr}
                data-selected={isSelected}
                onClick={() => onSelectDate(item.dateStr)}
                className={`flex flex-col items-center justify-center min-w-[56px] py-2.5 px-2 rounded-2xl transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-102 ring-2 ring-blue-600 ring-offset-2'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100'
                }`}
              >
                {/* Weekday */}
                <span
                  className={`text-[11px] font-semibold mb-0.5 ${
                    isSelected
                      ? 'text-blue-100'
                      : item.isToday
                      ? 'text-blue-600 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {item.isToday ? '오늘' : item.dayName}
                </span>

                {/* Day Number */}
                <span className="text-base font-black tracking-tight">{item.dayNum}</span>

                {/* Adherence Dot */}
                <div className="mt-1 flex items-center justify-center h-2">
                  {item.isFull ? (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? 'bg-emerald-300' : 'bg-emerald-500'
                      }`}
                      title="100% 복용 완료"
                    />
                  ) : item.hasAny ? (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? 'bg-amber-300' : 'bg-amber-500'
                      }`}
                      title={`${item.completionRate}% 복용`}
                    />
                  ) : (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-blue-400' : 'bg-slate-300'
                      }`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Past Date Status Notice Banner */}
      {isPast && (
        <div className="bg-indigo-50 border border-indigo-200/80 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                  과거 복약 기록 조회
                </span>
                <span className="text-xs font-bold text-indigo-900">{selectedDateFormatted}</span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-800 mt-0.5">
                과거 날짜의 복약 기록을 확인하고 있습니다. 누락된 약물이 있다면 체크박스를 눌러 언제든 수정할 수 있습니다.
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectDate(todayDateStr)}
            className="text-xs font-bold bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-2xs"
          >
            오늘로 돌아가기 →
          </button>
        </div>
      )}

      {/* 3. Toss-style Greeting & Routine Summary Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {isToday ? 'TODAY ROUTINE' : `${selectedDate} 복약`}
              </span>
              <span className="text-xs text-slate-400">4분할 타임라인 케어</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {completionPercentage === 100 ? (
                <span className="text-emerald-600">이 날의 모든 복약을 완료했어요! 🎉</span>
              ) : (
                <>
                  {isToday ? '오늘' : `${selectedDateFormatted}`} 복약할 약물이{' '}
                  <span className="text-blue-600 underline decoration-blue-200 decoration-wavy">
                    {totalTasks - completedTasks}개
                  </span>{' '}
                  남았어요
                </>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              정확한 시간에 복용하고, 간과 위장에 무리가 가지 않도록 안전 가이드를 확인하세요.
            </p>
          </div>

          {/* Quick action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {completedTasks < totalTasks ? (
              <button
                onClick={handleMarkAllDone}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>모두 복용 완료 처리</span>
              </button>
            ) : (
              <button
                onClick={handleClearAllDone}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>체크 초기화</span>
              </button>
            )}

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm shadow-blue-500/20 transition-all cursor-pointer whitespace-nowrap"
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

      {/* 4. Filter Tabs for 4-slot Timeline */}
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

      {/* 5. 4 Time Slots List for Selected Date */}
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
                            onClick={() => onToggleRoutine(slotInfo.slot, med.id, selectedDate)}
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

      {/* 6. Monthly Adherence Calendar Modal */}
      {isCalendarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-base text-slate-900">월간 복약 캘린더 히스토리</h3>
              </div>
              <button
                onClick={() => setIsCalendarModalOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1 rounded-lg"
              >
                닫기
              </button>
            </div>

            <p className="text-xs text-slate-500">
              원하는 날짜를 클릭하면 해당 날짜의 복약 내역을 확인하고 체크를 수정할 수 있습니다.
            </p>

            {/* Days Grid: Past 21 days */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
              {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
                <div key={d} className="font-bold text-slate-400 py-1">
                  {d}
                </div>
              ))}

              {dateStripList.map((item) => {
                const isSelected = item.dateStr === selectedDate;
                return (
                  <button
                    key={item.dateStr}
                    onClick={() => {
                      onSelectDate(item.dateStr);
                      setIsCalendarModalOpen(false);
                    }}
                    className={`py-2 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-blue-600 text-white font-black'
                        : item.isToday
                        ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{item.dayNum}</span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-1 ${
                        item.isFull
                          ? isSelected
                            ? 'bg-emerald-300'
                            : 'bg-emerald-500'
                          : item.hasAny
                          ? isSelected
                            ? 'bg-amber-300'
                            : 'bg-amber-500'
                          : 'bg-transparent'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-4 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                모두 복용 (100%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                일부 복용
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                미복용
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
