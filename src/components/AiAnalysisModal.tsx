import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  Search,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldAlert,
  Loader2,
  FileText,
  Pill,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { MedicationItem, TimingSlot } from '../types/medication';
import { SAMPLE_PRESCRIPTIONS } from '../data/initialMedications';

interface AiAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMedications: (newMeds: MedicationItem[]) => void;
}

export const AiAnalysisModal: React.FC<AiAnalysisModalProps> = ({
  isOpen,
  onClose,
  onAddMedications,
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'text'>('upload');
  const [inputText, setInputText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<{
    summary?: string;
    medications: MedicationItem[];
    organHealthAdvice?: { liverCare?: string; stomachCare?: string };
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle image upload from file or camera
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMime(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = (event.target?.result as string).split(',')[1];
      setImagePreview(base64Data);
    };
    reader.readAsDataURL(file);
  };

  // Run AI analysis
  const executeAnalysis = async (customText?: string, customImage?: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setAnalysisResult(null);

    const textToAnalyze = customText !== undefined ? customText : inputText;
    const imageToAnalyze = customImage !== undefined ? customImage : imagePreview;

    if (!textToAnalyze && !imageToAnalyze) {
      setErrorMsg('사진을 업로드하거나 약품명/처방전 텍스트를 입력해 주세요.');
      setIsLoading(false);
      return;
    }

    try {
      setLoadingStep('처방전 및 라벨 텍스트 고정밀 판독 중...');
      await new Promise((r) => setTimeout(r, 600));

      setLoadingStep('유효 약학 성분 및 권장 복용량 데이터베이스 매칭 중...');

      const response = await fetch('/api/analyze-medication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToAnalyze,
          image: imageToAnalyze,
          mimeType: imageMime,
        }),
      });

      setLoadingStep('간·위장 대사 부담 및 유예 시간(음식 상호작용) 분석 중...');

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.details || errData.error || '분석에 실패했습니다.');
      }

      const data = await response.json();

      // Ensure medications have safe defaults
      const formattedMeds: MedicationItem[] = (data.medications || []).map((m: any, idx: number) => ({
        id: m.id || `med-ai-${Date.now()}-${idx}`,
        name: m.name || '처방 약물',
        category: m.category || '전문의약품',
        ingredients: m.ingredients || [],
        dosage: m.dosage || '1정',
        frequency: m.frequency || '1일 2~3회',
        timings: Array.isArray(m.timings) && m.timings.length > 0 ? m.timings : ['morning', 'dinner'],
        intakeTimingRule: m.intakeTimingRule || 'after_meal',
        intakeTimingText: m.intakeTimingText || '식후 30분 복용',
        liverBurden: m.liverBurden || 'low',
        liverBurdenReason: m.liverBurdenReason || '간 부담 경미',
        stomachBurden: m.stomachBurden || 'low',
        stomachBurdenReason: m.stomachBurdenReason || '위장 자극 경미',
        avoidFoods: m.avoidFoods || [],
        cautions: m.cautions || [],
        registeredAt: new Date().toISOString().split('T')[0],
      }));

      setAnalysisResult({
        summary: data.summary,
        medications: formattedMeds,
        organHealthAdvice: data.organHealthAdvice,
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'AI 분석 처리 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // Toggle timing slot in preview
  const handleToggleTimingInPreview = (medIdx: number, slot: TimingSlot) => {
    if (!analysisResult) return;
    const updated = [...analysisResult.medications];
    const med = updated[medIdx];
    if (med.timings.includes(slot)) {
      med.timings = med.timings.filter((t) => t !== slot);
    } else {
      med.timings = [...med.timings, slot];
    }
    setAnalysisResult({ ...analysisResult, medications: updated });
  };

  // Commit medications to routine
  const handleSaveToRoutine = () => {
    if (!analysisResult || analysisResult.medications.length === 0) return;
    onAddMedications(analysisResult.medications);
    onClose();
  };

  // Quick preset loader
  const handleSelectPreset = (presetText: string) => {
    setInputText(presetText);
    setActiveMode('text');
    executeAnalysis(presetText, undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">AI 성분 분석 및 등록</h2>
              <p className="text-xs text-slate-500">처방전이나 라벨을 판독해 복약 루틴과 주의사항을 자동 생성합니다</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Mode Switcher */}
          {!analysisResult && (
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveMode('upload')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeMode === 'upload' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>처방전 / 라벨 사진 촬영 및 업로드</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('text')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeMode === 'text' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>텍스트 검색 / 직접 입력</span>
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm p-4 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
              <div>
                <p className="font-bold">분석 중 문제가 발생했습니다</p>
                <p className="mt-0.5 text-rose-600">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="py-12 px-4 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
                <Sparkles className="w-6 h-6 text-blue-600 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-black text-slate-900">Gemini 3.8 Flash가 정밀 분석 중입니다</h3>
                <p className="text-xs sm:text-sm text-blue-600 font-semibold animate-pulse">{loadingStep}</p>
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                약학 데이터베이스와 대조하여 복용 시간, 간·위장 부담도 및 음식 상호작용 규칙을 생성하고 있습니다.
              </p>
            </div>
          )}

          {/* Step 1: Input Mode Content */}
          {!isLoading && !analysisResult && (
            <>
              {activeMode === 'upload' ? (
                <div className="space-y-4">
                  {/* File Upload / Camera Zone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/20 rounded-3xl p-8 text-center cursor-pointer transition-all group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {imagePreview ? (
                      <div className="space-y-3">
                        <img
                          src={`data:${imageMime};base64,${imagePreview}`}
                          alt="업로드된 처방전 미리보기"
                          className="max-h-48 mx-auto rounded-xl shadow-md object-contain border border-slate-200"
                        />
                        <p className="text-xs text-blue-600 font-bold">사진이 등록되었습니다. 다시 누르면 변경합니다.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                          <Upload className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            처방전, 약 봉투, 영양제 라벨 사진을 업로드하세요
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            클릭하여 갤러리에서 선택하거나 카메라로 바로 촬영하세요 (JPG, PNG)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sample presets for 1-click test */}
                  <div className="pt-2">
                    <p className="text-xs font-bold text-slate-500 mb-2.5">또는 샘플 처방전으로 1초 만에 바로 체험하기:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {SAMPLE_PRESCRIPTIONS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleSelectPreset(preset.text)}
                          className="p-3 text-left rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer group"
                        >
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block mb-1">
                            {preset.badge}
                          </span>
                          <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 line-clamp-1">
                            {preset.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">클릭 시 자동 분석 시작 →</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => executeAnalysis()}
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-sm shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>업로드된 사진으로 성분 분석 시작</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      약품명 또는 처방전 내용 입력
                    </label>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="예: 타이레놀 500mg, 이지엔6 이브 1일 2회 복용중입니다. 커피랑 같이 먹어도 되나요?"
                      rows={4}
                      className="w-full text-sm p-3.5 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Quick Pill Chips */}
                  <div>
                    <p className="text-xs font-medium text-slate-400 mb-2">빠른 추천 입력 키워드:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        '타이레놀 500mg',
                        '이지엔6 프로',
                        '아목시실린 항생제',
                        '종합비타민 & 미네랄',
                        '오메가3 1000mg',
                        '마그네슘 300mg',
                        '역류성식도염 위장약',
                      ].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setInputText((prev) => (prev ? `${prev}, ${item}` : item))}
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          + {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => executeAnalysis()}
                    disabled={!inputText.trim()}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold text-sm rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>AI로 성분 및 상호작용 분석하기</span>
                  </button>
                </div>
              )}
            </>
          )}

          {/* Step 2: Analysis Result Preview */}
          {!isLoading && analysisResult && (
            <div className="space-y-5">
              {/* Summary Banner */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <h4 className="font-bold text-emerald-950">
                    성분 분석 완료 ({analysisResult.medications.length}종의 의약품/영양제 감지)
                  </h4>
                  <p className="text-emerald-800 mt-1">{analysisResult.summary}</p>
                </div>
              </div>

              {/* Medication cards in preview */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-700">
                  타임라인 배정 확인 (원하는 복용 시간대를 클릭해 변경할 수 있습니다):
                </p>

                {analysisResult.medications.map((med, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base">{med.name}</h4>
                          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                            {med.category}
                          </span>
                          <span className="text-[11px] text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                            {med.dosage}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          주요 성분: {med.ingredients.join(', ') || '상세 성분 추출됨'}
                        </p>
                      </div>

                      {/* Organ burden badge preview */}
                      <div className="text-right shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-md inline-block ${
                            med.liverBurden === 'high'
                              ? 'bg-rose-100 text-rose-800'
                              : med.stomachBurden === 'high'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {med.liverBurden === 'high'
                            ? '간 주의'
                            : med.stomachBurden === 'high'
                            ? '위장 주의'
                            : '장기부담 경미'}
                        </span>
                      </div>
                    </div>

                    {/* Timeline Slot Selection Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs text-slate-500 font-medium mr-1">복용 시간대:</span>
                      {[
                        { slot: 'morning', label: '아침' },
                        { slot: 'lunch', label: '점심' },
                        { slot: 'dinner', label: '저녁' },
                        { slot: 'bedtime', label: '취침 전' },
                      ].map(({ slot, label }) => {
                        const isSelected = med.timings.includes(slot as TimingSlot);
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => handleToggleTimingInPreview(idx, slot as TimingSlot)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {isSelected ? `✓ ${label}` : label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Avoid foods inline */}
                    {med.avoidFoods && med.avoidFoods.length > 0 && (
                      <div className="bg-white rounded-xl p-2.5 border border-slate-200/60 text-xs space-y-1">
                        <span className="font-bold text-amber-900 block">⚠️ 피해야 할 음식 및 유예 시간:</span>
                        {med.avoidFoods.map((f, fIdx) => (
                          <div key={fIdx} className="text-slate-600 flex items-start gap-1">
                            <span className="text-amber-500">•</span>
                            <span>
                              <strong className="text-slate-800">{f.food}</strong>: {f.gracePeriod} ({f.reason})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAnalysisResult(null)}
                  className="flex-1 py-3 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-2xl transition-all cursor-pointer"
                >
                  다시 분석하기
                </button>
                <button
                  type="button"
                  onClick={handleSaveToRoutine}
                  className="flex-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-sm shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>내 4분할 루틴에 등록하기 ({analysisResult.medications.length}개)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
