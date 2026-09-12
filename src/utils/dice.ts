import { DiceRollResult } from '../types/tools';

export const roll = (sides: number, count: number = 1): number[] => {
  const results: number[] = [];
  for (let i = 0; i < count; i++) {
    results.push(Math.floor(Math.random() * sides) + 1);
  }
  return results;
};

export const rollSum = (sides: number, count: number = 1, bonus: number = 0): number => {
  const rolls = roll(sides, count);
  return rolls.reduce((sum, val) => sum + val, 0) + bonus;
};

// 1D100判定 (6th/7th)
export const evaluate1D100 = (
  target: number,
  edition: '6th' | '7th' = '6th',
  label?: string
): DiceRollResult => {
  const d100 = roll(100, 1)[0];
  let judgment: DiceRollResult['judgment'] = 'failure';

  if (edition === '7th') {
    // 7版ルール判定
    // 決定的成功: 1
    // 致命的失敗: 目標値50未満なら96-100、目標値50以上なら100
    // イクストリーム成功: 目標値の1/5以下
    // ハード成功: 目標値の1/2以下
    // レギュラー成功: 目標値以下
    const fumbleThreshold = target < 50 ? 96 : 100;
    if (d100 === 1) {
      judgment = 'critical';
    } else if (d100 >= fumbleThreshold) {
      judgment = 'fumble';
    } else if (d100 <= Math.floor(target / 5)) {
      judgment = 'extreme_success';
    } else if (d100 <= Math.floor(target / 2)) {
      judgment = 'hard_success';
    } else if (d100 <= target) {
      judgment = 'success';
    } else {
      judgment = 'failure';
    }
  } else {
    // 6版ルール判定
    // 決定的成功: 1〜5 (またはハウスルールで1)
    // 致命的失敗: 96〜100 (またはハウスルールで100)
    // スペシャル: 目標値の1/5以下
    if (d100 <= 5 && d100 <= target) {
      judgment = 'critical';
    } else if (d100 >= 96) {
      judgment = 'fumble';
    } else if (d100 <= Math.floor(target / 5)) {
      judgment = 'special';
    } else if (d100 <= target) {
      judgment = 'success';
    } else {
      judgment = 'failure';
    }
  }

  return {
    id: `dice_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    formula: '1D100',
    rolls: [d100],
    total: d100,
    target,
    judgment,
    label,
  };
};

// 任意のダイス式 (e.g. "1D6", "2D6+6", "1D100", "1D10*10")
export const rollFormula = (formulaStr: string, label?: string): DiceRollResult => {
  const clean = formulaStr.trim().toUpperCase();
  const match = clean.match(/^(\d+)D(\d+)([+-]\d+)?$/);

  if (match) {
    const count = parseInt(match[1], 10);
    const sides = parseInt(match[2], 10);
    const bonus = match[3] ? parseInt(match[3], 10) : 0;
    const rolls = roll(sides, count);
    const total = rolls.reduce((a, b) => a + b, 0) + bonus;

    return {
      id: `dice_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      formula: clean,
      rolls,
      total,
      label
    };
  }

  // 単純な数値計算または未対応フォーマット
  return {
    id: `dice_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toLocaleTimeString('ja-JP'),
    formula: formulaStr,
    rolls: [1],
    total: 1,
    label: label || '無効なダイス式'
  };
};
