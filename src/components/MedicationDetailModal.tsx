import React from 'react';
import {
  X,
  Clock,
  Flame,
  AlertTriangle,
  ShieldCheck,
  Trash2,
  Calendar,
  Pill,
} from 'lucide-react';
import { MedicationItem, TimingSlot } from '../types/medication';

interface MedicationDetailModalProps {
  medication: MedicationItem | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

const TIMING_LABELS: Record<TimingSlot, string> = {
  morning: '아침',
  lunch: '점심',
  dinner: '저녁',
  bedtime: '취침 전',
};

export const MedicationDetailModal: React.FC<MedicationDetailModalProps> = ({
  medication,
  onClose,
  onDelete,
}) => {
  if (!medication) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                {medication.category}
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900">{medication.name}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Key Facts */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[11px] text-slate-400 block font-medium">1회 권장 복용량</span>
              <strong className="text-slate-800 text-sm font-bold">{medication.dosage}</strong>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[11px] text-slate-400 block font-medium">복용 타이밍 지침</span>
              <strong className="text-slate-800 text-sm font-bold">{medication.intakeTimingText}</strong>
            </div>
          </div>

          {/* Active Timing Slots */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5">
            <span className="text-xs font-bold text-slate-700 block">설정된 타임라인:</span>
            <div className="flex items-center gap-2">
              {(['morning', 'lunch', 'dinner', 'bedtime'] as TimingSlot[]).map((slot) => {
                const isActive = medication.timings.includes(slot);
                return (
                  <span
                    key={slot}
                    className={`px-3 py-1 rounded-xl font-bold text-xs ${
                      isActive ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-200/60 text-slate-400 line-through'
                    }`}
                  >
                    {TIMING_LABELS[slot]}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Ingredients */}
          {medication.ingredients.length > 0 && (
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <span className="text-xs font-bold text-slate-700 block mb-1">유효 성분 및 배합:</span>
              <div className="flex flex-wrap gap-1.5">
                {medication.ingredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-white text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-lg"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Organ Impact Details */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700">장기 부담 및 대사 경로:</h4>
            {/* Liver */}
            <div
              className={`p-3 rounded-2xl border ${
                medication.liverBurden === 'high'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-emerald-50 border-emerald-100 text-emerald-900'
              }`}
            >
              <div className="flex items-center gap-2 font-bold mb-0.5">
                <Flame className="w-4 h-4" />
                <span>간 부담도: {medication.liverBurden === 'high' ? '높음 (주의)' : '낮음/보통'}</span>
              </div>
              <p className="text-xs opacity-90 leading-relaxed">{medication.liverBurdenReason}</p>
            </div>

            {/* Stomach */}
            <div
              className={`p-3 rounded-2xl border ${
                medication.stomachBurden === 'high'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-100 text-emerald-900'
              }`}
            >
              <div className="flex items-center gap-2 font-bold mb-0.5">
                <AlertTriangle className="w-4 h-4" />
                <span>위장 자극도: {medication.stomachBurden === 'high' ? '높음 (식후 복용 필수)' : '낮음/보통'}</span>
              </div>
              <p className="text-xs opacity-90 leading-relaxed">{medication.stomachBurdenReason}</p>
            </div>
          </div>

          {/* Avoid foods */}
          {medication.avoidFoods && medication.avoidFoods.length > 0 && (
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">피해야 할 음식 및 구체적 유예 시간:</span>
              <div className="space-y-1.5">
                {medication.avoidFoods.map((f, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-xs">
                    <div className="flex justify-between items-center mb-0.5">
                      <strong className="text-slate-900">🚫 {f.food}</strong>
                      <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {f.gracePeriod}
                      </span>
                    </div>
                    <p className="text-slate-500">{f.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cautions */}
          {medication.cautions && medication.cautions.length > 0 && (
            <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <strong className="text-slate-700 block mb-1">약사 특별 복약 지도:</strong>
              <ul className="list-disc list-inside space-y-0.5">
                {medication.cautions.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm(`'${medication.name}'을(를) 복약 루틴에서 삭제하시겠습니까?`)) {
                onDelete(medication.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>이 약물 삭제</span>
          </button>

          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
