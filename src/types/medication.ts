export type TimingSlot = 'morning' | 'lunch' | 'dinner' | 'bedtime';

export type OrganBurden = 'low' | 'medium' | 'high';

export type FoodSeverity = 'critical' | 'warning' | 'caution';

export interface AvoidFoodItem {
  food: string;
  severity: FoodSeverity;
  gracePeriod: string;
  reason: string;
}

export interface MedicationItem {
  id: string;
  name: string;
  category: string;
  ingredients: string[];
  dosage: string;
  frequency?: string;
  timings: TimingSlot[];
  intakeTimingRule?: 'before_meal' | 'after_meal' | 'empty_stomach' | 'anytime';
  intakeTimingText: string;
  liverBurden: OrganBurden;
  liverBurdenReason: string;
  stomachBurden: OrganBurden;
  stomachBurdenReason: string;
  avoidFoods: AvoidFoodItem[];
  cautions?: string[];
  notes?: string;
  color?: string;
  registeredAt?: string;
}

export interface DailyRoutineState {
  // Key format: `${dateStr}_${slot}_${medId}` -> boolean
  [key: string]: boolean;
}

export interface SafetyCheckResult {
  safetyStatus: 'safe' | 'warning' | 'danger';
  statusTitle: string;
  gracePeriod: string;
  organImpact?: {
    liver: string;
    stomach: string;
  };
  explanation: string;
  alternativeTip?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}
