export interface HandoutItem {
  id: string;
  title: string;
  publicInfo: string;
  secretInfo: string;
  assignedTo?: string;
}

export interface ScenarioSection {
  id: string;
  title: string;
  type: 'intro' | 'event' | 'climax' | 'npc' | 'ending' | 'secret';
  isSpoiler: boolean;
  content: string;
}

export interface ScenarioData {
  id: string;
  title: string;
  author: string;
  edition: 'both' | '6th' | '7th';
  players: string; // e.g. "2〜4人"
  playTime: string; // e.g. "3〜4時間"
  setting: string; // e.g. "現代日本", "1920s アメリカ"
  lostRate: 'low' | 'medium' | 'high' | 'very_high';
  recommendedSkills: string[];
  tags: string[];
  catchphrase: string;
  summary: string;
  truth: string; // 真相（KP向けネタバレ）
  handouts: HandoutItem[];
  sections: ScenarioSection[];
  createdAt: string;
  updatedAt: string;
}
