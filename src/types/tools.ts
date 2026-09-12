export interface Combatant {
  id: string;
  name: string;
  dex: number;
  hp: number;
  maxHp: number;
  isEnemy: boolean;
  statusText: string;
  hasActed: boolean;
}

export interface DiceRollResult {
  id: string;
  timestamp: string;
  formula: string;
  rolls: number[];
  total: number;
  target?: number;
  judgment?: 'critical' | 'special' | 'success' | 'hard_success' | 'extreme_success' | 'failure' | 'fumble';
  label?: string;
  isSecret?: boolean;
}

export interface MadnessEntry {
  number: number;
  title: string;
  duration: string;
  description: string;
}
