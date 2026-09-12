export type RuleEdition = '6th' | '7th';

export interface AbilityScores {
  str: number;
  con: number;
  pow: number;
  dex: number;
  app: number;
  siz: number;
  int: number;
  edu: number;
}

export interface SkillItem {
  id: string;
  name: string;
  category: 'combat' | 'search' | 'negotiation' | 'knowledge' | 'action' | 'other';
  initValue: number;
  jobValue: number;
  hobbyValue: number;
  growthValue: number;
  edition: 'both' | '6th' | '7th';
}

export interface CharacterData {
  id: string;
  name: string;
  kana: string;
  edition: RuleEdition;
  job: string;
  age: number | string;
  gender: string;
  origin: string;
  abilities: AbilityScores;
  // 算出値
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  san: number;
  maxSan: number;
  initialSan: number;
  idea: number; // 6th: INT*5
  luck: number; // 6th: POW*5, 7th: 3D6*5
  know: number; // 6th: EDU*5
  damageBonus: string;
  build: number; // 7th
  moveRate: number; // 7th
  // 技能
  skills: SkillItem[];
  jobPointsRemaining: number;
  hobbyPointsRemaining: number;
  // プロフィール
  backstory: {
    personalDescription: string; // 容姿・特徴
    ideology: string; // 信念
    significantPeople: string; // 大切な人
    meaningfulLocations: string; // 意味のある場所
    treasuredPossessions: string; // 秘蔵の品
    traits: string; // 特徴・癖
    injuriesScars: string; // 負傷・傷跡
    phobiasManias: string; // 恐怖症・マニア
  };
  memo: string;
  updatedAt: string;
}
