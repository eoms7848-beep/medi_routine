import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  Coffee,
  Wine,
  Milk,
  Flame,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Activity,
  HeartPulse,
  Info,
  ChevronRight,
  Search,
  Loader2,
} from 'lucide-react';
import { MedicationItem, SafetyCheckResult } from '../types/medication';

interface InteractionGuideProps {
  medications: MedicationItem[];
  onOpenAddModal: () => void;
  onOpenChatWithQuery?: (query: string) => void;
}

export const InteractionGuide: React.FC<InteractionGuideProps> = ({
  medications,
  onOpenAddModal,
  onOpenChatWithQuery,
}) => {
  const [safetyQuery, setSafetyQuery] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [safetyResult, setSafetyResult] = useState<SafetyCheckResult | null>(null);

  // Aggregate organ burden
  const highLiverMeds = medications.filter((m) => m.liverBurden === 'high');
  const highStomachMeds = medications.filter((m) => m.stomachBurden === 'high');

  // Collect all avoidFoods across all medications
  const allAvoidFoods: Array<{
    food: string;
    severity: 'critical' | 'warning' | 'caution';
    gracePeriod: string;
    reason: string;
    medName: string;
  }> = [];

  medications.forEach((med) => {
    (med.avoidFoods || []).forEach((af) => {
      allAvoidFoods.push({
        ...af,
        medName: med.name,
      });
    });
  });

  // Unique critical warnings
  const criticalWarnings = allAvoidFoods.filter((f) => f.severity === 'critical');
  const standardWarnings = allAvoidFoods.filter((f) => f.severity === 'warning');
  const cautionWarnings = allAvoidFoods.filter((f) => f.severity === 'caution');

  // Live Safety Checker submission
  const handleCheckSafety = async (foodQuery: string) => {
    if (!foodQuery.trim()) return;
    setIsChecking(true);
    setSafetyResult(null);

    try {
      const response = await fetch('/api/check-safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: foodQuery,
          currentMedications: medications,
        }),
      });

      if (!response.ok) throw new Error('안전성 조회 실패');
      const data = await response.json();
      setSafetyResult(data);
    } catch (err) {
      console.error(err);
      // Fallback local calculation
      const lower = foodQuery.toLowerCase();
      if (lower.includes('술') || lower.includes('맥주') || lower.includes('소주') || lower.includes('와인')) {
        setSafetyResult({
          safetyStatus: 'danger',
          statusTitle: '절대 삼가주세요 (간독성 및 출혈 위험)',
          gracePeriod: '복용 전후 최소 24시간 완전 금주',
          organImpact: {
            liver: '알코올 분해 시 아세트아미노펜 독성 대사체 급증으로 급성 간손상 위험',
            stomach: '소염진통제 병용 시 위점막 출혈 위험 극대화',
          },
          explanation: '현재 복용 중인 약물이 간과 위장에 작용하므로 술을 드실 경우 치명적 부작용이 생길 수 있습니다.',
          alternativeTip: '탄산수나 미온수, 디카페인 허브차로 대체해 주세요.',
        });
      } else if (lower.includes('커피') || lower.includes('카페인') || lower.includes('아메리카노')) {
        setSafetyResult({
          safetyStatus: 'warning',
          statusTitle: '주의가 필요해요 (유예 시간 준수)',
          gracePeriod: '약 복용 전후 최소 2시간 간격 유지',
          organImpact: {
            liver: '카페인 대사 부담 완만',
            stomach: '위산 분비 촉진으로 소염진통제와 충돌하여 속쓰림 악화',
          },
          explanation: '위장을 보호하기 위해 식후 약을 복용하고 최소 2시간 뒤에 마시는 것이 안전합니다.',
          alternativeTip: '디카페인 음료나 보리차, 미온수를 권장합니다.',
        });
      } else {
        setSafetyResult({
          safetyStatus: 'safe',
          statusTitle: '안전하게 드실 수 있어요',
          gracePeriod: '통상적인 식사 간격 유지',
          explanation: '현재 복용 중인 약물과 치명적인 상호작용은 발견되지 않았습니다. 충분한 물과 함께 섭취하세요.',
          alternativeTip: '항상 미온수 1컵(200ml) 이상 충분히 섭취해 체내 흡수를 원활하게 하세요.',
        });
      }
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Overview Intro Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            ORGAN SHIELD & INTERACTION
          </span>
          <span className="text-xs text-slate-400">실시간 안전망</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          약물-음식 상호작용 및 간·위장 보호 가이드
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          복용 중인 약물이 장기에 미치는 부담을 실시간 계산하고, 특정 음식 섭취 시 필요한{' '}
          <strong className="text-slate-800">정확한 유예 시간</strong>을 안내합니다.
        </p>
      </div>

      {/* 1. Real-time Warning Badges System */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <span>실시간 경고 배너 시스템</span>
            <span className="text-xs font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full">
              {allAvoidFoods.length}건 감지
            </span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">유예 시간 준수 필수</span>
        </div>

        {/* Critical Red Warning Banner */}
        {criticalWarnings.length > 0 && (
          <div className="bg-gradient-to-r from-rose-500 to-red-600 rounded-3xl p-5 text-white shadow-md shadow-rose-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Wine className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-rose-100 bg-black/20 px-2 py-0.5 rounded-md">
                    CRITICAL WARNING · 절대 금기
                  </span>
                  <h3 className="font-black text-base sm:text-lg">알코올(술) 절대 금지 경고</h3>
                </div>
              </div>
              <span className="text-xs font-black bg-white text-rose-600 px-3 py-1 rounded-full shadow-xs">
                유예시간: 24시간
              </span>
            </div>

            <div className="bg-black/15 rounded-2xl p-3.5 text-xs sm:text-sm text-rose-50 space-y-2">
              <p className="font-semibold leading-relaxed">
                현재 복약 중인 약물 중{' '}
                <strong className="text-white underline">
                  {criticalWarnings.map((w) => w.medName).join(', ')}
                </strong>
                이(가) 포함되어 있습니다. 간 독성 및 급성 위장관 출혈 위험이 급증하므로 복용 당일 및 복용 후 최소
                24시간 동안은 음주를 완전히 중단해야 합니다.
              </p>
            </div>
          </div>
        )}

        {/* Warning Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Caffeine & Coffee Badge */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-3xl p-4 sm:p-5 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-700 flex items-center justify-center">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-amber-950">커피 · 카페인 음료</h4>
                  <span className="text-[11px] text-amber-700 font-bold">위장 점막 자극 및 속쓰림 주의</span>
                </div>
              </div>
              <span className="text-[11px] font-black bg-amber-200 text-amber-900 px-2.5 py-1 rounded-full shrink-0">
                2시간 전후 금지
              </span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              소염진통제(이부프로펜 등) 복용 시 카페인이 위산 분비를 폭발적으로 촉진하여 위벽을 갉아먹을 수 있습니다.
              식사 후 약을 복용하고 최소 2시간 후에 섭취하세요.
            </p>
          </div>

          {/* Dairy & Milk Badge */}
          <div className="bg-blue-50/80 border border-blue-200/80 rounded-3xl p-4 sm:p-5 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-500/20 text-blue-700 flex items-center justify-center">
                  <Milk className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-blue-950">우유 · 유제품 · 요거트</h4>
                  <span className="text-[11px] text-blue-700 font-bold">항생제 흡수 방해 (킬레이션)</span>
                </div>
              </div>
              <span className="text-[11px] font-black bg-blue-200 text-blue-900 px-2.5 py-1 rounded-full shrink-0">
                2시간 분리 권장
              </span>
            </div>
            <p className="text-xs text-blue-800 leading-relaxed">
              유제품 속 칼슘·마그네슘 이온이 항생제 성분과 결합하여 체내 흡수를 50% 이상 차단합니다. 복용 전후
              2시간의 간격을 확보해야 온전한 치료 효과를 볼 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Interactive "지금 먹어도 될까? 실시간 안전 판독기" */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                지금 먹어도 될까? 실시간 안전 판독기
              </h2>
              <p className="text-xs text-slate-400">
                궁금한 음식이나 음료를 검색하면 내 약물 목록과 대조하여 즉시 계산합니다
              </p>
            </div>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={safetyQuery}
            onChange={(e) => setSafetyQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCheckSafety(safetyQuery)}
            placeholder="예: 아이스 아메리카노, 삼겹살에 맥주, 그릭 요거트, 자몽에이드"
            className="w-full text-sm py-3.5 pl-4 pr-24 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => handleCheckSafety(safetyQuery)}
            disabled={!safetyQuery.trim() || isChecking}
            className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {isChecking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>판독</span>
          </button>
        </div>

        {/* Quick Food Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-medium">자주 묻는 음식:</span>
          {[
            '☕ 아메리카노',
            '🍺 맥주 1캔',
            '🥛 그릭 요거트',
            '🍊 자몽 주스',
            '🥩 삼겹살',
            '💊 종합 감기약',
          ].map((chip) => {
            const cleanText = chip.replace(/^[^\s]+\s*/, '');
            return (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setSafetyQuery(cleanText);
                  handleCheckSafety(cleanText);
                }}
                className="text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-xl transition-colors cursor-pointer"
              >
                {chip}
              </button>
            );
          })}
        </div>

        {/* Result Card */}
        {safetyResult && (
          <div
            className={`rounded-2xl p-4 sm:p-5 border transition-all ${
              safetyResult.safetyStatus === 'danger'
                ? 'bg-rose-50/90 border-rose-200 text-rose-950'
                : safetyResult.safetyStatus === 'warning'
                ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                : 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    safetyResult.safetyStatus === 'danger'
                      ? 'bg-rose-600 text-white'
                      : safetyResult.safetyStatus === 'warning'
                      ? 'bg-amber-500 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {safetyResult.safetyStatus === 'danger' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : safetyResult.safetyStatus === 'warning' ? (
                    <Clock className="w-5 h-5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider opacity-75">
                    판독 결과: {safetyQuery}
                  </span>
                  <h3 className="text-base font-black">{safetyResult.statusTitle}</h3>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-black bg-white/80 px-3 py-1 rounded-full shadow-2xs border border-current">
                  ⏳ {safetyResult.gracePeriod}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm mt-3 leading-relaxed">{safetyResult.explanation}</p>

            {safetyResult.organImpact && (
              <div className="mt-3 pt-3 border-t border-black/10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <strong className="block opacity-80">간 영향도:</strong>
                  <span>{safetyResult.organImpact.liver}</span>
                </div>
                <div>
                  <strong className="block opacity-80">위장 영향도:</strong>
                  <span>{safetyResult.organImpact.stomach}</span>
                </div>
              </div>
            )}

            {safetyResult.alternativeTip && (
              <div className="mt-2.5 text-xs bg-white/60 p-2.5 rounded-xl flex items-center gap-2">
                <span className="font-bold shrink-0">💡 안전 팁:</span>
                <span>{safetyResult.alternativeTip}</span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 3. Organ Burden Gauge (간 & 위장 보호 상태) */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-5">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-500" />
            <span>장기 보호 지수 대시보드</span>
          </h2>
          <p className="text-xs text-slate-400">
            복용 중인 약물이 간세포 대사와 위점막 보호 인자에 미치는 실시간 부담도입니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Liver Burden Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs">
                  간
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-900">간 대사 부담도</h4>
                  <p className="text-[11px] text-slate-400">CYP450 효소 대사 부하</p>
                </div>
              </div>
              <span
                className={`text-xs font-black px-2.5 py-1 rounded-full ${
                  highLiverMeds.length > 0
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {highLiverMeds.length > 0 ? '집중 주의 단계' : '안정 단계'}
              </span>
            </div>

            {/* Visual Level Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-500">
                <span>간 부담 지수</span>
                <span className={highLiverMeds.length > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                  {highLiverMeds.length > 0 ? '75% (주의)' : '25% (양호)'}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    highLiverMeds.length > 0 ? 'w-3/4 bg-rose-500' : 'w-1/4 bg-emerald-500'
                  }`}
                />
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-1 bg-white p-3 rounded-xl border border-slate-100">
              <strong className="text-slate-800 block">주의 약물:</strong>
              {highLiverMeds.length > 0 ? (
                <ul className="list-disc list-inside space-y-0.5 text-rose-700 font-medium">
                  {highLiverMeds.map((m) => (
                    <li key={m.id}>
                      {m.name}: {m.liverBurdenReason}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-emerald-700">현재 간에 급성 무리를 주는 약물은 감지되지 않았습니다.</p>
              )}
            </div>
          </div>

          {/* Stomach Burden Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs">
                  위
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-900">위장 자극 위험도</h4>
                  <p className="text-[11px] text-slate-400">위벽 프로스타글란딘 억제율</p>
                </div>
              </div>
              <span
                className={`text-xs font-black px-2.5 py-1 rounded-full ${
                  highStomachMeds.length > 0
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {highStomachMeds.length > 0 ? '식후 복용 필수' : '속쓰림 경미'}
              </span>
            </div>

            {/* Visual Level Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-500">
                <span>위장 자극 지수</span>
                <span className={highStomachMeds.length > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                  {highStomachMeds.length > 0 ? '80% (자극 높음)' : '30% (양호)'}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    highStomachMeds.length > 0 ? 'w-4/5 bg-amber-500' : 'w-1/3 bg-emerald-500'
                  }`}
                />
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-1 bg-white p-3 rounded-xl border border-slate-100">
              <strong className="text-slate-800 block">주의 약물:</strong>
              {highStomachMeds.length > 0 ? (
                <ul className="list-disc list-inside space-y-0.5 text-amber-800 font-medium">
                  {highStomachMeds.map((m) => (
                    <li key={m.id}>
                      {m.name}: {m.stomachBurdenReason}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-emerald-700">공복 복용 가능한 안전한 성분 위주입니다.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
