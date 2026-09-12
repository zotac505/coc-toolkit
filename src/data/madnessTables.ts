import { MadnessEntry } from '../types/tools';

export const SHORT_TERM_MADNESS: MadnessEntry[] = [
  { number: 1, title: '気絶 / 卒倒', duration: '1D10ラウンド', description: '探索者はその場に崩れ落ち、気を失う。' },
  { number: 2, title: 'パニック発作', duration: '1D10ラウンド', description: '盲目的なパニックに陥り、叫びながら手近な出口へ全力で逃走する。' },
  { number: 3, title: '身体的ヒステリー / 吐き気', duration: '1D10ラウンド', description: '激しい嘔吐や震えに見舞われ、行動が著しく制限される。' },
  { number: 4, title: '偏執病 / 疑心暗鬼', duration: '1D10ラウンド', description: '誰も信じられなくなり、味方さえも敵や化け物に見える。' },
  { number: 5, title: '見当識障害 / 健忘', duration: '1D10ラウンド', description: '自分が誰で、どこにいて、何が起きたのか完全に忘れてしまう。' },
  { number: 6, title: '狂乱の怒り / 暴力衝動', duration: '1D10ラウンド', description: '身近にいる対象（敵味方問わず）へ無差別に暴力を振るい始める。' },
  { number: 7, title: '幻覚 / 幻聴', duration: '1D10ラウンド', description: '怪物の足音や囁き声、存在しない異様な光景に幻惑される。' },
  { number: 8, title: '反響動作 / 模倣', duration: '1D10ラウンド', description: '他人の言動や音を無意識に真似し続け、自分の意思で行動できない。' },
  { number: 9, title: '奇妙な執着 / 食行動異常', duration: '1D10ラウンド', description: '生肉や土、紙などを貪り食ったり、特定の無意味な作業に没頭する。' },
  { number: 10, title: '緊張病症 / カタトニア', duration: '1D10ラウンド', description: '身体が硬直して一切の反応を示さなくなり、人形のようになってしまう。' },
];

export const LONG_TERM_MADNESS: MadnessEntry[] = [
  { number: 1, title: '失語症 / 選択性無言症', duration: '1D10×10時間', description: '恐怖により声が出なくなり、意思疎通が身振り手振りのみになる。' },
  { number: 2, title: '重度の偏執病', duration: '1D10×10時間', description: '「誰かが自分を監視している、命を狙っている」という妄想に取り憑かれる。' },
  { number: 3, title: '幻覚への囚われ', duration: '1D10×10時間', description: '常に神話的恐怖や恐ろしい過去の幻影が見え隠れし、正気と狂気の境が曖昧になる。' },
  { number: 4, title: '特定の恐怖症（恐怖症表を参照）', duration: '1D10×10時間', description: '遭遇した恐怖の原因に関連する事象（暗闇、水、血など）に対して極度のパニックを起こす。' },
  { number: 5, title: 'フェティシズム / 強迫的執着', duration: '1D10×10時間', description: '特定の人物、物体、儀式的な動作を手放せなくなる。' },
  { number: 6, title: '心因性盲目 / 聾（耳が聞こえない）', duration: '1D10×10時間', description: '精神的なショックにより、視覚または聴覚が一時的に完全に遮断される。' },
  { number: 7, title: '記憶喪失（局所的）', duration: '1D10×10時間', description: '恐怖体験およびそれに付随する直近の記憶がごっそり抜け落ちる。' },
  { number: 8, title: '多重人格 / 人格変容', duration: '1D10×10時間', description: '極端に攻撃的、または極端に幼い別の人格が現れ、表層の言動を支配する。' },
  { number: 9, title: '自殺願望 / 破滅的衝動', duration: '1D10×10時間', description: 'すべてを終わらせるため、危険な行動や自傷衝動に駆られる。' },
  { number: 10, title: '過眠 / 昏睡状態', duration: '1D10×10時間', description: '悪夢に苛まれながら深い眠りに落ち、呼びかけにも容易には目覚めない。' },
];

export const PHOBIA_SAMPLES = [
  '暗所恐怖症（スコトフォビア）',
  '閉所恐怖症（クラウストロフォビア）',
  '死体恐怖症（ネクロフォビア）',
  '血液恐怖症（ヘモフォビア）',
  '昆虫恐怖症（エントモフォビア）',
  '異形恐怖症（テラトフォビア）',
  '水恐怖症（アクアフォビア）',
  '鏡恐怖症（アイスオプトフォビア）',
  '高所恐怖症（アクロフォビア）',
  '群衆恐怖症（デモフォビア）'
];

export const MANIA_SAMPLES = [
  '放火癖（パイロマニア）',
  '窃盗癖（クレプトマニア）',
  '潔癖症・手洗い強迫',
  '神話収集癖（ビブリオマニア）',
  '刃物執着（アイヒモマニア）',
  '独り言・呪文詠唱マニア',
  '解剖・切断への興味',
  '嘘つき癖（虚言癖）'
];
