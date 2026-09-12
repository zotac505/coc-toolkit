import { CharacterData } from '../types/character';
import { ScenarioData } from '../types/scenario';
import { SAMPLE_SCENARIOS } from '../data/sampleScenarios';

const CHARACTERS_STORAGE_KEY = 'coc_toolkit_characters_v1';
const SCENARIOS_STORAGE_KEY = 'coc_toolkit_scenarios_v1';

// --- キャラクター関連 ---
export const loadCharacters = (): CharacterData[] => {
  try {
    const raw = localStorage.getItem(CHARACTERS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load characters from LocalStorage', e);
    return [];
  }
};

export const saveCharacter = (character: CharacterData): void => {
  const list = loadCharacters();
  const index = list.findIndex(c => c.id === character.id);
  if (index >= 0) {
    list[index] = { ...character, updatedAt: new Date().toISOString() };
  } else {
    list.unshift({ ...character, updatedAt: new Date().toISOString() });
  }
  localStorage.setItem(CHARACTERS_STORAGE_KEY, JSON.stringify(list));
};

export const deleteCharacter = (id: string): void => {
  const list = loadCharacters().filter(c => c.id !== id);
  localStorage.setItem(CHARACTERS_STORAGE_KEY, JSON.stringify(list));
};

// --- シナリオ関連 ---
export const loadScenarios = (): ScenarioData[] => {
  try {
    const raw = localStorage.getItem(SCENARIOS_STORAGE_KEY);
    if (!raw) {
      // 初回はサンプルシナリオを格納
      localStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(SAMPLE_SCENARIOS));
      return SAMPLE_SCENARIOS;
    }
    const parsed = JSON.parse(raw);
    return parsed.length > 0 ? parsed : SAMPLE_SCENARIOS;
  } catch (e) {
    console.error('Failed to load scenarios from LocalStorage', e);
    return SAMPLE_SCENARIOS;
  }
};

export const saveScenario = (scenario: ScenarioData): void => {
  const list = loadScenarios();
  const index = list.findIndex(s => s.id === scenario.id);
  if (index >= 0) {
    list[index] = { ...scenario, updatedAt: new Date().toISOString() };
  } else {
    list.unshift({ ...scenario, updatedAt: new Date().toISOString() });
  }
  localStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(list));
};

export const deleteScenario = (id: string): void => {
  const list = loadScenarios().filter(s => s.id !== id);
  localStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(list));
};

// --- ファイル入出力 ---
export const downloadJsonFile = (filename: string, data: unknown): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
