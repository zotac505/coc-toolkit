import { CharacterData } from '../types/character';

export interface CCfoliaClipboardData {
  kind: 'character';
  data: {
    name: string;
    memo: string;
    initiative: number;
    externalUrl?: string;
    iconUrl?: string;
    status: Array<{
      label: string;
      value: number;
      max: number;
    }>;
    params: Array<{
      label: string;
      value: string;
    }>;
    commands: string;
  };
}

export const generateChatPalette = (char: CharacterData): string => {
  const lines: string[] = [];

  lines.push(`// --- 能力値判定 ---`);
  lines.push(`CC<={\${DEX}*5} 【DEX×5】`);
  lines.push(`CC<={\${CON}*5} 【CON×5】`);
  lines.push(`CC<={\${STR}*5} 【STR×5】`);
  lines.push(`CC<={\${APP}*5} 【APP×5】`);
  lines.push(`CC<={\${POW}*5} 【POW×5】`);
  lines.push(`CC<={\${INT}*5} 【アイデア】`);
  lines.push(`CC<={\${EDU}*5} 【知識】`);
  lines.push(`CC<={\${SAN}} 【SANチェック】`);
  lines.push(``);

  lines.push(`// --- 技能ロール ---`);
  char.skills.forEach((skill) => {
    const total = skill.initValue + skill.jobValue + skill.hobbyValue + skill.growthValue;
    if (total > 0) {
      if (char.edition === '7th') {
        lines.push(`CC<=${total} 【${skill.name}】`);
      } else {
        lines.push(`CCB<=${total} 【${skill.name}】`);
      }
    }
  });

  lines.push(``);
  lines.push(`// --- ダメージ ---`);
  if (char.damageBonus && char.damageBonus !== '0') {
    lines.push(`1D3+${char.damageBonus} 【こぶし/素手ダメージ】`);
    lines.push(`1D4+${char.damageBonus} 【キックダメージ】`);
  } else {
    lines.push(`1D3 【こぶし/素手ダメージ】`);
  }

  return lines.join('\n');
};

export const generateCCfoliaData = (char: CharacterData): CCfoliaClipboardData => {
  return {
    kind: 'character',
    data: {
      name: char.name || '名称未設定の探索者',
      memo: [
        `PL: -`,
        `職業: ${char.job || '未設定'} / 年齢: ${char.age || '-'} / 性別: ${char.gender || '-'}`,
        `DB: ${char.damageBonus || '0'}`,
        char.memo ? `\n【メモ】\n${char.memo}` : ''
      ].filter(Boolean).join('\n'),
      initiative: char.abilities.dex || 10,
      iconUrl: char.imageUrl
        ? char.imageUrl.startsWith('http')
          ? char.imageUrl
          : `https://zotac505.github.io/coc-toolkit/${char.imageUrl.replace(/^\.\//, '')}`
        : undefined,
      status: [
        { label: 'HP', value: char.hp, max: char.maxHp },
        { label: 'MP', value: char.mp, max: char.maxMp },
        { label: 'SAN', value: char.san, max: char.maxSan },
      ],
      params: [
        { label: 'STR', value: String(char.abilities.str) },
        { label: 'CON', value: String(char.abilities.con) },
        { label: 'POW', value: String(char.abilities.pow) },
        { label: 'DEX', value: String(char.abilities.dex) },
        { label: 'APP', value: String(char.abilities.app) },
        { label: 'SIZ', value: String(char.abilities.siz) },
        { label: 'INT', value: String(char.abilities.int) },
        { label: 'EDU', value: String(char.abilities.edu) },
      ],
      commands: generateChatPalette(char),
    },
  };
};

export const copyCCfoliaDataToClipboard = async (char: CharacterData): Promise<boolean> => {
  try {
    const data = generateCCfoliaData(char);
    const jsonString = JSON.stringify(data, null, 2);
    await navigator.clipboard.writeText(jsonString);
    return true;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
};
