import { MedicationItem } from '../types/medication';

export const INITIAL_MEDICATIONS: MedicationItem[] = [
  {
    id: 'med-tylenol-500',
    name: '타이레놀 정 500mg (아세트아미노펜)',
    category: '해열진통제',
    ingredients: ['아세트아미노펜 500mg'],
    dosage: '1정 (1일 2~3회)',
    frequency: '1일 2회',
    timings: ['morning', 'dinner'],
    intakeTimingRule: 'anytime',
    intakeTimingText: '식사 무관 (미온수 복용)',
    liverBurden: 'high',
    liverBurdenReason: '간에서 95% 이상 대사되며 알코올 분해효소와 충돌하여 급성 간독성(NAPQI 축적)을 유발할 수 있습니다.',
    stomachBurden: 'low',
    stomachBurdenReason: '위장관 점막 자극이 적어 빈속에도 복용 가능합니다.',
    avoidFoods: [
      {
        food: '술 / 알코올',
        severity: 'critical',
        gracePeriod: '복용 전후 최소 24시간 완전 금주',
        reason: '간 대사 효소(CYP2E1)가 유도되어 치명적인 간세포 괴사 및 급성 간부전을 유발할 수 있습니다.',
      },
      {
        food: '고카페인 에너지 드링크',
        severity: 'caution',
        gracePeriod: '복용 전후 1시간 간격 권장',
        reason: '카페인과 아세트아미노펜이 함께 체내에 흡수되면 중추신경 자극 및 심계항진이 발생할 수 있습니다.',
      },
    ],
    cautions: ['다른 아세트아미노펜 함유 감기약과 중복 복용 금지 (일일 최대 4,000mg 초과 주의)'],
    color: 'emerald',
    registeredAt: '2026-10-28',
  },
  {
    id: 'med-ezn6-eve',
    name: '이지엔6 이브 연질캡슐',
    category: '소염진통제 (NSAIDs)',
    ingredients: ['이부프로펜 200mg', '파마브롬 25mg'],
    dosage: '1캡슐',
    frequency: '1일 1회 필요시',
    timings: ['lunch'],
    intakeTimingRule: 'after_meal',
    intakeTimingText: '식후 즉시 (충분한 물과 함께)',
    liverBurden: 'low',
    liverBurdenReason: '신장으로 주로 배설되므로 간에 대한 직접적인 부담은 상대적으로 낮습니다.',
    stomachBurden: 'high',
    stomachBurdenReason: '위 점막을 보호하는 프로스타글란딘 합성을 억제하여 속쓰림, 위염, 위궤양 유발 위험이 높습니다.',
    avoidFoods: [
      {
        food: '커피 / 카페인 음료',
        severity: 'warning',
        gracePeriod: '복용 전후 2시간 금지',
        reason: '카페인이 위산 분비를 급증시켜 소염진통제에 의한 위벽 손상을 가속화하고 속쓰림을 악화시킵니다.',
      },
      {
        food: '탄산음료 / 매운 음식',
        severity: 'warning',
        gracePeriod: '복용 전후 2시간 분리 권장',
        reason: '산성 음료나 자극적 향신료가 위장 점막을 2차 자극하여 위통을 유발할 수 있습니다.',
      },
      {
        food: '술 / 알코올',
        severity: 'critical',
        gracePeriod: '복용 당일 금주',
        reason: '알코올과 소염진통제가 결합하면 위장관 출혈 위험이 급격히 증가합니다.',
      },
    ],
    cautions: ['공복 복용 절대 금지', '속이 쓰릴 경우 제산제나 위장보호제와 함께 복용'],
    color: 'rose',
    registeredAt: '2026-10-28',
  },
  {
    id: 'med-clavixin-amoxicillin',
    name: '클라빅신 정 (아목시실린+클라불란산)',
    category: '페니실린계 광범위 항생제',
    ingredients: ['아목시실린수화물 250mg', '클라불란산칼륨 125mg'],
    dosage: '1정 (1일 2회)',
    frequency: '1일 2회 (8~12시간 간격)',
    timings: ['morning', 'dinner'],
    intakeTimingRule: 'after_meal',
    intakeTimingText: '식사 시작 직전 또는 식후 30분',
    liverBurden: 'medium',
    liverBurdenReason: '일부 환자에서 일시적인 간 효소(ALT/AST) 수치 상승이 관찰될 수 있습니다.',
    stomachBurden: 'medium',
    stomachBurdenReason: '장내 정상 세균총에 영향을 주어 소화불량이나 묽은 변을 유발할 수 있습니다.',
    avoidFoods: [
      {
        food: '우유 / 치즈 / 그릭 요거트 (유제품)',
        severity: 'warning',
        gracePeriod: '복용 전후 2시간 금지',
        reason: '유제품의 칼슘/마그네슘 이온이 항생제 성분과 불용성 킬레이트를 형성해 혈중 약물 흡수율을 50% 이상 떨어뜨립니다.',
      },
      {
        food: '생유산균 제제',
        severity: 'caution',
        gracePeriod: '항생제 복용 2~3시간 후 섭취',
        reason: '항생제가 복용한 유산균을 곧바로 사멸시키므로 시간 간격을 두어야 장 건강 효과를 볼 수 있습니다.',
      },
    ],
    cautions: ['증상이 호전되어도 처방된 일수를 모두 끝까지 복용해야 내성을 예방할 수 있습니다.'],
    color: 'amber',
    registeredAt: '2026-10-28',
  },
  {
    id: 'med-rtg-omega3',
    name: 'rTG 프리미엄 오메가3 & 비타민D',
    category: '혈행 개선 및 지용성 영양제',
    ingredients: ['EPA 및 DHA 함유유지 1,000mg', '비타민D3 2,000IU'],
    dosage: '1캡슐',
    frequency: '1일 1회',
    timings: ['morning'],
    intakeTimingRule: 'after_meal',
    intakeTimingText: '아침 식사 직후 (기름진 음식과 함께)',
    liverBurden: 'low',
    liverBurdenReason: '간 대사 부담이 거의 없으며 체내 지질 대사 개선에 도움을 줍니다.',
    stomachBurden: 'low',
    stomachBurdenReason: '공복 섭취 시 특유의 생선 비린내 역류나 더부룩함이 생길 수 있으므로 식후 복용 권장.',
    avoidFoods: [
      {
        food: '뜨거운 차 / 펄펄 끓는 물',
        severity: 'caution',
        gracePeriod: '미온수로 복용',
        reason: '뜨거운 물은 연질 캡슐을 식도에서 조기 용해시켜 어취가 올라올 수 있습니다.',
      },
    ],
    cautions: ['아스피린 등 항응고제를 복용 중일 경우 출혈 경향에 유의'],
    color: 'blue',
    registeredAt: '2026-10-28',
  },
  {
    id: 'med-magnesium-sleep',
    name: '킬레이트 마그네슘 & 비타민B6',
    category: '근육 이완 / 신경안정 영양제',
    ingredients: ['비스글리시네이트 마그네슘 300mg', '피리독신(B6) 5mg'],
    dosage: '2정',
    frequency: '1일 1회 취침 전',
    timings: ['bedtime'],
    intakeTimingRule: 'empty_stomach',
    intakeTimingText: '취침 30분~1시간 전 미온수 복용',
    liverBurden: 'low',
    liverBurdenReason: '간 부담이 없으며 신경 전달 물질 가바(GABA) 합성을 돕습니다.',
    stomachBurden: 'low',
    stomachBurdenReason: '고용량 산화마그네슘에 비해 킬레이트 형태는 설사나 위장 자극이 현저히 적습니다.',
    avoidFoods: [
      {
        food: '야간 카페인 / 녹차 / 홍차',
        severity: 'warning',
        gracePeriod: '취침 4시간 전 섭취 중단',
        reason: '카페인이 이뇨 작용을 촉진하여 마그네슘의 체외 배출을 가속화하고 수면 유도 효과를 상쇄합니다.',
      },
    ],
    cautions: ['신장 기능이 저하된 환자는 고마그네슘혈증 주의'],
    color: 'purple',
    registeredAt: '2026-10-28',
  },
];

export const SAMPLE_PRESCRIPTIONS = [
  {
    id: 'preset-cold',
    title: '급성 상기도염(감기·몸살) 처방전',
    badge: '이비인후과 처방',
    text: `[처방전] 환자명: 홍길동
진단명: 급성 상기도염 및 편도염
1. 타이레놀이알서방정 650mg (아세트아미노펜) 1일 3회 아침/점심/저녁 식후
2. 코푸정 (진해거담제) 1일 3회 아침/점심/저녁
3. 무코스타정 100mg (레바미피드 위점막보호제) 1일 3회
4. 세파클러캡슐 250mg (세팔로스포린계 항생제) 1일 3회 아침/점심/저녁`,
  },
  {
    id: 'preset-supplements',
    title: '직장인 피로회복 & 뼈 건강 영양제 세트',
    badge: '영양제 조합',
    text: `[복용 중인 영양제 라벨]
1. 활성형 비타민B 콤플렉스 (비맥스 메타) 1일 1정 아침 식후 즉시
2. 식물성 알티지 오메가3 1000mg 1일 1캡슐 아침 식후
3. 밀크씨슬 실리마린 130mg (간 건강 피로개선) 1일 1정 저녁 식후
4. 구연산 칼슘 + 마그네슘 + 비타민D 1일 2정 취침 전 복용`,
  },
  {
    id: 'preset-gastric',
    title: '역류성 식도염 & 관절염 처방전',
    badge: '내과/정형외과 처방',
    text: `[처방전]
1. 넥시움정 20mg (에스오메프라졸 위산분비억제제) 1일 1회 아침 식전 30분 공복
2. 쎄레브렉스 캡슐 200mg (세레콕시브 관절소염제) 1일 1회 저녁 식후
3. 스티렌투엑스정 (애엽추출물 위염치료제) 1일 2회 아침/저녁`,
  },
];
