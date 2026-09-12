import React, { useState, useMemo } from 'react';
import type { CharacterData, RuleEdition, SkillItem, AbilityScores } from '../../types/character';
import { calculateDerivedStats, rollInitialAbilities } from '../../utils/characterCalc';
import { copyCCfoliaDataToClipboard } from '../../utils/ccfolia';
import { saveCharacterToGitHub } from '../../utils/githubSync';
import { processImageFile } from '../../utils/imageUtils';
import { BACKSTORY_TABLES, getRandomItem } from '../../data/backstoryGenerators';
import { downloadJsonFile } from '../../utils/storage';
import { 
  Dices, 
  Sparkles, 
  Copy, 
  Save, 
  Download, 
  ArrowLeft, 
  Check, 
  RefreshCw, 
  Plus, 
  Trash2,
  AlertCircle,
  Image as ImageIcon,
  Camera,
  HelpCircle,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface CharacterEditorProps {
  initialCharacter: CharacterData;
  onSave: (char: CharacterData) => void;
  onCancel: () => void;
}

const ABILITY_INFO: Record<keyof AbilityScores, {
  name: string;
  dice6th: string;
  dice7th: string;
  desc: string;
  affects: string;
}> = {
  str: { name: '筋力', dice6th: '3D6', dice7th: '3D6×5', desc: '物理的な力強さ・筋力', affects: 'DB・近接戦闘' },
  con: { name: '体力', dice6th: '3D6', dice7th: '3D6×5', desc: '健康状態・生命力・毒耐性', affects: 'HP・ショック耐性' },
  pow: { name: '精神力', dice6th: '3D6', dice7th: '3D6×5', desc: '意志の強さ・魔力・精神安定', affects: 'SAN・MP・幸運(6版)' },
  dex: { name: '敏捷性', dice6th: '3D6', dice7th: '3D6×5', desc: '身軽さ・反射神経・素早さ', affects: '回避・行動順' },
  app: { name: '外見', dice6th: '3D6', dice7th: '3D6×5', desc: '魅力・好感度・容貌の良さ', affects: '対人関係' },
  siz: { name: '体格', dice6th: '2D6+6', dice7th: '(2D6+6)×5', desc: '体の大きさ・身長・体重', affects: 'HP・DB・ビルド' },
  int: { name: '知性', dice6th: '2D6+6', dice7th: '(2D6+6)×5', desc: '理解力・ひらめき・直感', affects: 'アイデア・興味技能P' },
  edu: { name: '教育', dice6th: '3D6+3', dice7th: '(3D6+3)×5', desc: '学歴・教養・知識の深さ', affects: '職業技能P・知識・母国語' },
};

export const CharacterEditor: React.FC<CharacterEditorProps> = ({
  initialCharacter,
  onSave,
  onCancel,
}) => {
  const [char, setChar] = useState<CharacterData>(initialCharacter);
  const [copied, setCopied] = useState(false);
  const [showFormulaGuide, setShowFormulaGuide] = useState(false);
  const [activeSkillCategory, setActiveSkillCategory] = useState<string>('all');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillInit, setNewSkillInit] = useState(1);
  const [isSyncing, setIsSyncing] = useState(false);

  // 立ち絵画像State
  const [previewImageUrl, setPreviewImageUrl] = useState<string | undefined>(char.imageUrl);
  const [pendingImageBase64, setPendingImageBase64] = useState<string | undefined>(undefined);

  // 画像選択ハンドラ
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const processed = await processImageFile(file, 800);
      setPreviewImageUrl(processed.dataUrl);
      setPendingImageBase64(processed.base64);
    } catch (err) {
      alert('画像の読み込みに失敗しました');
    }
  };

  // 画像削除ハンドラ
  const handleRemoveImage = () => {
    setPreviewImageUrl(undefined);
    setPendingImageBase64(undefined);
    setChar(prev => ({ ...prev, imageUrl: undefined }));
  };

  // 一本化した保存ハンドラ（ローカル＋リポジトリ自動コミット）
  const handleSave = async () => {
    setIsSyncing(true);
    const result = await saveCharacterToGitHub(char, pendingImageBase64);
    setIsSyncing(false);
    alert(result.message);
    if (result.success) {
      onSave(char);
    }
  };

  // 6版/7版の切り替え
  const handleEditionChange = (newEdition: RuleEdition) => {
    if (newEdition === char.edition) return;
    const factor = newEdition === '7th' ? 5 : 0.2;
    const updatedAbilities = {
      str: Math.round(char.abilities.str * factor),
      con: Math.round(char.abilities.con * factor),
      pow: Math.round(char.abilities.pow * factor),
      dex: Math.round(char.abilities.dex * factor),
      app: Math.round(char.abilities.app * factor),
      siz: Math.round(char.abilities.siz * factor),
      int: Math.round(char.abilities.int * factor),
      edu: Math.round(char.abilities.edu * factor),
    };
    const derived = calculateDerivedStats(updatedAbilities, newEdition);
    setChar(prev => ({
      ...prev,
      edition: newEdition,
      abilities: updatedAbilities,
      ...derived,
    }));
  };

  // 能力値一括ロール
  const handleRollAllAbilities = () => {
    const newAbilities = rollInitialAbilities(char.edition);
    const derived = calculateDerivedStats(newAbilities, char.edition);
    const updatedSkills = char.skills.map(s => {
      if (s.id === 'dodge') {
        const init = char.edition === '7th' ? Math.floor(newAbilities.dex / 2) : newAbilities.dex * 2;
        return { ...s, initValue: init };
      }
      if (s.id === 'own_lang') {
        const init = char.edition === '7th' ? newAbilities.edu : newAbilities.edu * 5;
        return { ...s, initValue: init };
      }
      return s;
    });

    setChar(prev => ({
      ...prev,
      abilities: newAbilities,
      skills: updatedSkills,
      ...derived,
    }));
  };

  // 能力値の直接変更
  const handleAbilityChange = (key: keyof typeof char.abilities, value: number) => {
    const updatedAbilities = { ...char.abilities, [key]: value };
    const derived = calculateDerivedStats(updatedAbilities, char.edition);
    setChar(prev => ({
      ...prev,
      abilities: updatedAbilities,
      ...derived,
    }));
  };

  // 技能ポイント計算
  const maxJobPoints = useMemo(() => {
    return char.edition === '7th' ? char.abilities.edu * 4 : char.abilities.edu * 20;
  }, [char.edition, char.abilities.edu]);

  const maxHobbyPoints = useMemo(() => {
    return char.edition === '7th' ? char.abilities.int * 2 : char.abilities.int * 10;
  }, [char.edition, char.abilities.int]);

  const usedJobPoints = useMemo(() => {
    return char.skills.reduce((sum, s) => sum + (s.jobValue || 0), 0);
  }, [char.skills]);

  const usedHobbyPoints = useMemo(() => {
    return char.skills.reduce((sum, s) => sum + (s.hobbyValue || 0), 0);
  }, [char.skills]);

  const remainingJobPoints = maxJobPoints - usedJobPoints;
  const remainingHobbyPoints = maxHobbyPoints - usedHobbyPoints;

  // 技能値の更新
  const handleSkillValueChange = (
    skillId: string,
    field: 'jobValue' | 'hobbyValue' | 'growthValue',
    val: number
  ) => {
    setChar(prev => ({
      ...prev,
      skills: prev.skills.map(s => {
        if (s.id === skillId) {
          return { ...s, [field]: Math.max(0, val) };
        }
        return s;
      }),
    }));
  };

  // 自由技能の追加
  const handleAddCustomSkill = () => {
    if (!newSkillName.trim()) return;
    const newSkill: SkillItem = {
      id: `custom_${Date.now()}`,
      name: newSkillName.trim(),
      category: 'other',
      initValue: Math.max(1, newSkillInit),
      jobValue: 0,
      hobbyValue: 0,
      growthValue: 0,
      edition: 'both',
    };
    setChar(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
    setNewSkillName('');
    setNewSkillInit(1);
  };

  // バックストーリーランダム生成
  const handleGenerateBackstoryField = (field: keyof typeof BACKSTORY_TABLES) => {
    if (BACKSTORY_TABLES[field]) {
      const generated = getRandomItem(BACKSTORY_TABLES[field]);
      setChar(prev => ({
        ...prev,
        backstory: { ...prev.backstory, [field]: generated },
      }));
    }
  };

  const handleGenerateAllBackstory = () => {
    setChar(prev => ({
      ...prev,
      backstory: {
        personalDescription: getRandomItem(BACKSTORY_TABLES.personalDescription),
        ideology: getRandomItem(BACKSTORY_TABLES.ideology),
        significantPeople: getRandomItem(BACKSTORY_TABLES.significantPeople),
        meaningfulLocations: getRandomItem(BACKSTORY_TABLES.meaningfulLocations),
        treasuredPossessions: getRandomItem(BACKSTORY_TABLES.treasuredPossessions),
        traits: getRandomItem(BACKSTORY_TABLES.traits),
        injuriesScars: prev.backstory.injuriesScars,
        phobiasManias: prev.backstory.phobiasManias,
      },
    }));
  };

  // 技能初期値の算出式ヒント
  const getSkillInitFormula = (skillId: string, edition: RuleEdition) => {
    if (skillId === 'dodge') {
      return edition === '7th' ? 'DEX÷2' : 'DEX×2';
    }
    if (skillId === 'own_lang') {
      return edition === '7th' ? 'EDU' : 'EDU×5';
    }
    return null;
  };

  // ココフォリア用コピー
  const handleCopyCCfolia = async () => {
    const success = await copyCCfoliaDataToClipboard(char);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // 技能フィルタリング
  const filteredSkills = useMemo(() => {
    return char.skills.filter(s => {
      if (s.edition !== 'both' && s.edition !== char.edition) return false;
      if (activeSkillCategory === 'all') return true;
      return s.category === activeSkillCategory;
    });
  }, [char.skills, char.edition, activeSkillCategory]);

  return (
    <div className="space-y-4 sm:space-y-6 pb-20">
      {/* トップアクションバー（スマホ・PC両対応） */}
      <div className="bg-slate-900/90 p-3 sm:p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onCancel}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition shrink-0"
              title="戻る"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="truncate">
              <h2 className="text-base sm:text-lg font-bold text-slate-100 truncate">
                {char.name || '新規キャラクター'}
              </h2>
              <p className="text-xs text-slate-400">
                {char.edition === '7th' ? 'クトゥルフ神話TRPG 第7版' : 'クトゥルフ神話TRPG 第6版'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* 6版/7版 切り替えトグル */}
            <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => handleEditionChange('6th')}
                className={`px-2 py-1 rounded-md transition font-medium ${
                  char.edition === '6th'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                6版
              </button>
              <button
                onClick={() => handleEditionChange('7th')}
                className={`px-2 py-1 rounded font-medium transition ${
                  char.edition === '7th' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                }`}
              >
                7版
              </button>
            </div>

            {/* 保存ボタン（ローカル保存 ＋ リポジトリ自動アップロード） */}
            <button
              onClick={handleSave}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-md shadow-emerald-950/40 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSyncing ? 'アップロード中...' : '保存'}</span>
            </button>
          </div>
        </div>

        {/* サブアクション行（ココフォリア駒コピー・JSONダウンロード） */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
          <button
            onClick={handleCopyCCfolia}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-cyan-800 hover:bg-cyan-700 text-white text-xs font-medium transition shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'コピー完了！盤面に貼付可' : 'ココフォリア駒コピー'}</span>
          </button>

          <button
            onClick={() => downloadJsonFile(`${char.name || '探索者'}_sheet.json`, char)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition shrink-0"
            title="JSON形式でダウンロード"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 基本情報フォーム（立ち絵アップロード対応） */}
      <div className="bg-slate-900/60 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-3">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-400">
          基本情報 ＆ 立ち絵
        </h3>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* 立ち絵プレビュー＆アップロード枠 */}
          <div className="flex sm:flex-col items-center gap-3 shrink-0">
            <label className="relative group w-24 h-28 sm:w-28 sm:h-36 rounded-xl bg-slate-950 border-2 border-dashed border-slate-800 hover:border-emerald-500/60 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition shadow-inner">
              {previewImageUrl ? (
                <>
                  <img
                    src={previewImageUrl}
                    alt="立ち絵プレビュー"
                    className="w-full h-full object-cover group-hover:opacity-75 transition"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-slate-200 text-[10px]">
                    変更する
                  </div>
                </>
              ) : (
                <div className="text-center p-2 space-y-1 text-slate-500 group-hover:text-emerald-400 transition">
                  <Camera className="w-6 h-6 mx-auto" />
                  <span className="text-[10px] block font-medium">立ち絵登録</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {previewImageUrl && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-[10px] text-red-400 hover:text-red-300 py-0.5 px-2 rounded bg-red-950/40 border border-red-900/40 transition flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>立ち絵削除</span>
              </button>
            )}
          </div>

          {/* テキスト入力欄 */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[11px] text-slate-400 mb-1">探索者名</label>
              <input
                type="text"
                value={char.name}
                onChange={e => setChar({ ...char, name: e.target.value })}
                placeholder="例: 佐藤 健一"
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[11px] text-slate-400 mb-1">ふりがな</label>
              <input
                type="text"
                value={char.kana}
                onChange={e => setChar({ ...char, kana: e.target.value })}
                placeholder="例: さとう けんいち"
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[11px] text-slate-400 mb-1">職業</label>
              <input
                type="text"
                value={char.job}
                onChange={e => setChar({ ...char, job: e.target.value })}
                placeholder="例: 私立探偵 / 教授"
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="col-span-2 sm:col-span-1 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">年齢</label>
                <input
                  type="text"
                  value={char.age}
                  onChange={e => setChar({ ...char, age: e.target.value })}
                  placeholder="28"
                  className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm text-center focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">性別</label>
                <input
                  type="text"
                  value={char.gender}
                  onChange={e => setChar({ ...char, gender: e.target.value })}
                  placeholder="男"
                  className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-sm text-center focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 能力値＆算出ステータス */}
      <div className="bg-slate-900/60 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-400">
              能力値（Characteristic）
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              {char.edition === '7th' ? '第7版 (新クトゥルフ)' : '第6版 (クラシック)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFormulaGuide(!showFormulaGuide)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition border ${
                showFormulaGuide
                  ? 'bg-cyan-950/60 text-cyan-300 border-cyan-700/60'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/50'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showFormulaGuide ? 'ガイドを閉じる' : '🔰 計算式の解説ガイド'}</span>
              {showFormulaGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <button
              onClick={handleRollAllAbilities}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-600/30 text-xs font-medium transition"
              title="全能力値をダイスで再計算"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>一括ダイス</span>
            </button>
          </div>
        </div>

        {/* 初心者向け計算式早見表ガイド（トグル展開） */}
        {showFormulaGuide && (
          <div className="bg-slate-950/90 p-3.5 sm:p-4 rounded-xl border border-cyan-900/40 text-xs text-slate-300 space-y-3">
            <div className="flex items-center gap-2 font-bold text-cyan-400 text-xs sm:text-sm border-b border-cyan-900/30 pb-1.5">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>クトゥルフ神話TRPG ステータス計算の仕組み（{char.edition === '7th' ? '第7版' : '第6版'}）</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] leading-relaxed">
              <div className="space-y-1.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="font-bold text-emerald-400 block">🧠 なぜSAN値やMPが決まるの？</span>
                <p>
                  SAN値（正気度）やMP（魔力）は、精神的な強さを表す能力値<strong className="text-white">【POW】</strong>から算出されます。
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                  {char.edition === '6th' ? (
                    <>
                      <li><span className="text-slate-200">SAN値:</span> <span className="text-purple-300 font-mono">POW × 5</span> （例: POW 10なら 50%）</li>
                      <li><span className="text-slate-200">MP:</span> <span className="text-blue-300 font-mono">POW そのまま</span></li>
                      <li><span className="text-slate-200">幸運:</span> <span className="text-emerald-300 font-mono">POW × 5</span></li>
                    </>
                  ) : (
                    <>
                      <li><span className="text-slate-200">SAN値:</span> <span className="text-purple-300 font-mono">POW と同値</span> （7版は能力値自体が％表記のため）</li>
                      <li><span className="text-slate-200">MP:</span> <span className="text-blue-300 font-mono">POW ÷ 5</span></li>
                      <li><span className="text-slate-200">幸運:</span> <span className="text-emerald-300 font-mono">3D6 × 5</span> （独立してダイスで決定）</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="space-y-1.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                <span className="font-bold text-emerald-400 block">❤️ 耐久度（HP）や攻撃力の決まり方</span>
                <p>
                  HPやダメージボーナス（DB）は、肉体の頑丈さ<strong className="text-white">【CON】</strong>や体の大きさ<strong className="text-white">【SIZ】</strong>から求めます。
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                  {char.edition === '6th' ? (
                    <>
                      <li><span className="text-slate-200">HP:</span> <span className="text-red-300 font-mono">(CON + SIZ) ÷ 2</span>（端数切り上げ）</li>
                      <li><span className="text-slate-200">DB:</span> <span className="text-amber-300 font-mono">STR + SIZ</span> の合計値テーブルで決定</li>
                    </>
                  ) : (
                    <>
                      <li><span className="text-slate-200">HP:</span> <span className="text-red-300 font-mono">(CON + SIZ) ÷ 10</span>（端数切り捨て）</li>
                      <li><span className="text-slate-200">DB / ビルド:</span> <span className="text-amber-300 font-mono">STR + SIZ</span> の合計から算出</li>
                    </>
                  )}
                  <li><span className="text-slate-200">回避の初期値:</span> {char.edition === '7th' ? <span className="text-cyan-300 font-mono">DEX ÷ 2</span> : <span className="text-cyan-300 font-mono">DEX × 2</span>}</li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-900/40 p-2 rounded text-[11px] text-slate-400">
              💡 <span className="text-slate-300 font-medium">技能ポイントの計算式:</span> 職業Pは【EDU（教育）】、趣味・興味Pは【INT（知性）】から自動計算されます。各ステータスカードの下部にも具体的な計算式を表記しています。
            </div>
          </div>
        )}

        {/* 能力値グリッド（日本語名・ダイス式・影響先を明記） */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
          {(['str', 'con', 'pow', 'dex', 'app', 'siz', 'int', 'edu'] as const).map(key => {
            const info = ABILITY_INFO[key];
            const dice = char.edition === '7th' ? info.dice7th : info.dice6th;
            return (
              <div key={key} className="bg-slate-950 p-2 sm:p-2.5 rounded-lg border border-slate-800 text-center flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-xs font-black text-slate-200 uppercase tracking-wider">
                      {key}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({info.name})
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono block">
                    {dice}
                  </span>
                </div>

                <div className="my-0.5">
                  <input
                    type="number"
                    value={char.abilities[key]}
                    onChange={e => handleAbilityChange(key, parseInt(e.target.value, 10) || 0)}
                    className="w-full text-center text-lg sm:text-xl font-bold bg-transparent text-emerald-400 focus:outline-none focus:bg-slate-900 rounded"
                  />
                  {char.edition === '7th' && (
                    <div className="text-[9px] text-slate-500 font-mono">
                      ½:{Math.floor(char.abilities[key] / 2)} <span className="opacity-60">⅕:{Math.floor(char.abilities[key] / 5)}</span>
                    </div>
                  )}
                </div>

                <div className="text-[9px] text-slate-400 bg-slate-900/80 px-1 py-0.5 rounded truncate" title={`${info.desc} → 影響: ${info.affects}`}>
                  {info.affects}
                </div>
              </div>
            );
          })}
        </div>

        {/* 算出ステータス（計算根拠を明記） */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>算出ステータス（能力値から自動計算）</span>
            <span className="text-[10px] text-slate-500">※各ボックス内に計算式を表示</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2 text-center text-xs">
            {/* HP */}
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex flex-col justify-between">
              <span className="text-slate-400 text-[10px] block font-medium">HP (耐久)</span>
              <span className="text-sm sm:text-base font-bold text-red-400 my-0.5">{char.hp} / {char.maxHp}</span>
              <span className="text-[9px] text-slate-400 font-mono bg-slate-900/90 py-0.5 rounded px-1 block truncate" title={`式: ${char.edition === '7th' ? '(CON+SIZ)÷10' : '(CON+SIZ)÷2'}`}>
                {char.edition === '7th'
                  ? `(${char.abilities.con}+${char.abilities.siz})÷10`
                  : `(${char.abilities.con}+${char.abilities.siz})÷2`}
              </span>
            </div>

            {/* MP */}
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex flex-col justify-between">
              <span className="text-slate-400 text-[10px] block font-medium">MP (魔力)</span>
              <span className="text-sm sm:text-base font-bold text-blue-400 my-0.5">{char.mp} / {char.maxMp}</span>
              <span className="text-[9px] text-slate-400 font-mono bg-slate-900/90 py-0.5 rounded px-1 block truncate" title={char.edition === '7th' ? 'POW ÷ 5' : 'POWそのまま'}>
                {char.edition === '7th' ? `POW(${char.abilities.pow})÷5` : `POW(${char.abilities.pow})`}
              </span>
            </div>

            {/* SAN */}
            <div className="bg-slate-950 p-2 rounded-lg border border-purple-900/40 bg-purple-950/10 flex flex-col justify-between">
              <span className="text-purple-300 text-[10px] block font-medium">SAN (正気度)</span>
              <span className="text-sm sm:text-base font-bold text-purple-400 my-0.5">{char.san}</span>
              <span className="text-[9px] text-purple-300 font-mono bg-purple-950/50 py-0.5 rounded px-1 block truncate" title={char.edition === '7th' ? '7版初期SAN = POW値' : `6版初期SAN = POW × 5 (${char.abilities.pow}×5)`}>
                {char.edition === '7th' ? `POW値(${char.abilities.pow})` : `POW×5 (${char.abilities.pow}×5)`}
              </span>
            </div>

            {/* DB */}
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex flex-col justify-between">
              <span className="text-slate-400 text-[10px] block font-medium">DB (威力補正)</span>
              <span className="text-sm sm:text-base font-bold text-amber-400 my-0.5">{char.damageBonus}</span>
              <span className="text-[9px] text-slate-400 font-mono bg-slate-900/90 py-0.5 rounded px-1 block truncate" title={`STR(${char.abilities.str}) + SIZ(${char.abilities.siz}) = ${char.abilities.str + char.abilities.siz}`}>
                S+S={char.abilities.str + char.abilities.siz}
              </span>
            </div>

            {/* 幸運 */}
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex flex-col justify-between">
              <span className="text-slate-400 text-[10px] block font-medium">幸運</span>
              <span className="text-sm sm:text-base font-bold text-emerald-400 my-0.5">{char.luck}</span>
              <span className="text-[9px] text-slate-400 font-mono bg-slate-900/90 py-0.5 rounded px-1 block truncate" title={char.edition === '7th' ? '3D6 × 5 で独立決定' : `POW × 5 (${char.abilities.pow}×5)`}>
                {char.edition === '7th' ? '3D6×5' : `POW×5 (${char.abilities.pow}×5)`}
              </span>
            </div>

            {/* アイデア / ビルド */}
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex flex-col justify-between">
              <span className="text-slate-400 text-[10px] block font-medium">
                {char.edition === '7th' ? 'ビルド' : 'アイデア'}
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-300 my-0.5">
                {char.edition === '7th' ? char.build : char.idea}
              </span>
              <span className="text-[9px] text-slate-400 font-mono bg-slate-900/90 py-0.5 rounded px-1 block truncate">
                {char.edition === '7th' ? '体格規模' : `INT×5 (${char.abilities.int * 5})`}
              </span>
            </div>

            {/* 知識 (6th) または 移動率 (7th) */}
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex flex-col justify-between col-span-2 sm:col-span-1">
              <span className="text-slate-400 text-[10px] block font-medium">
                {char.edition === '7th' ? '移動率 (MOV)' : '知識'}
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-300 my-0.5">
                {char.edition === '7th' ? char.moveRate : char.know}
              </span>
              <span className="text-[9px] text-slate-400 font-mono bg-slate-900/90 py-0.5 rounded px-1 block truncate">
                {char.edition === '7th' ? 'DEX/STR/SIZ' : `EDU×5 (${char.abilities.edu * 5})`}
              </span>
            </div>
          </div>
        </div>

        {/* 技能ポイントメーター（計算式と配分根拠を明記） */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-200">職業技能P</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  ({char.edition === '7th' ? `EDU×4: ${char.abilities.edu}×4` : `EDU×20: ${char.abilities.edu}×20`} = {maxJobPoints}pt)
                </span>
              </div>
              <span className={remainingJobPoints < 0 ? 'text-red-400 font-bold' : 'text-emerald-400 font-medium'}>
                残 {remainingJobPoints} / {maxJobPoints}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${remainingJobPoints < 0 ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, (usedJobPoints / (maxJobPoints || 1)) * 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-200">趣味・興味技能P</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  ({char.edition === '7th' ? `INT×2: ${char.abilities.int}×2` : `INT×10: ${char.abilities.int}×10`} = {maxHobbyPoints}pt)
                </span>
              </div>
              <span className={remainingHobbyPoints < 0 ? 'text-red-400 font-bold' : 'text-cyan-400 font-medium'}>
                残 {remainingHobbyPoints} / {maxHobbyPoints}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${remainingHobbyPoints < 0 ? 'bg-red-500' : 'bg-cyan-500'}`}
                style={{ width: `${Math.min(100, (usedHobbyPoints / (maxHobbyPoints || 1)) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 技能一覧・ポイント配分（スマホ対応レスポンシブビュー） */}
      <div className="bg-slate-900/60 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-400">
            技能一覧・ポイント配分
          </h3>

          {/* カテゴリフィルター（横スクロール可能） */}
          <div className="flex overflow-x-auto no-scrollbar gap-1.5 pb-1">
            {[
              { id: 'all', label: 'すべて' },
              { id: 'search', label: '探索' },
              { id: 'negotiation', label: '交渉' },
              { id: 'action', label: '行動' },
              { id: 'combat', label: '戦闘' },
              { id: 'knowledge', label: '知識' },
              { id: 'other', label: 'その他' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveSkillCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition ${
                  activeSkillCategory === cat.id
                    ? 'bg-emerald-600 text-white font-medium'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* スマホ表示用カードビュー（sm未満） */}
        <div className="block sm:hidden space-y-2">
          {filteredSkills.map(skill => {
            const total = skill.initValue + skill.jobValue + skill.hobbyValue + skill.growthValue;
            return (
              <div key={skill.id} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-100">{skill.name}</span>
                    <span className="text-[10px] text-slate-500">
                      初期:{skill.initValue}%
                      {getSkillInitFormula(skill.id, char.edition) && (
                        <span className="ml-1 text-cyan-400 font-mono text-[9px]">
                          ({getSkillInitFormula(skill.id, char.edition)})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-emerald-400">{total}%</span>
                    {skill.id.startsWith('custom_') && (
                      <button
                        onClick={() =>
                          setChar(prev => ({
                            ...prev,
                            skills: prev.skills.filter(s => s.id !== skill.id),
                          }))
                        }
                        className="text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 3つの入力欄 */}
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div>
                    <span className="text-slate-500 block mb-0.5">職業P</span>
                    <input
                      type="number"
                      min="0"
                      value={skill.jobValue || ''}
                      onChange={e =>
                        handleSkillValueChange(skill.id, 'jobValue', parseInt(e.target.value, 10) || 0)
                      }
                      placeholder="0"
                      className="w-full text-center py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">趣味P</span>
                    <input
                      type="number"
                      min="0"
                      value={skill.hobbyValue || ''}
                      onChange={e =>
                        handleSkillValueChange(skill.id, 'hobbyValue', parseInt(e.target.value, 10) || 0)
                      }
                      placeholder="0"
                      className="w-full text-center py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">成長</span>
                    <input
                      type="number"
                      min="0"
                      value={skill.growthValue || ''}
                      onChange={e =>
                        handleSkillValueChange(skill.id, 'growthValue', parseInt(e.target.value, 10) || 0)
                      }
                      placeholder="0"
                      className="w-full text-center py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* PC表示用テーブル（sm以上） */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                <th className="p-2.5">技能名</th>
                <th className="p-2.5 text-center w-16">初期値</th>
                <th className="p-2.5 text-center w-20">職業P</th>
                <th className="p-2.5 text-center w-20">趣味P</th>
                <th className="p-2.5 text-center w-20">成長</th>
                <th className="p-2.5 text-center w-16 font-bold text-emerald-400">合計</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSkills.map(skill => {
                const total = skill.initValue + skill.jobValue + skill.hobbyValue + skill.growthValue;
                return (
                  <tr key={skill.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-2.5 font-medium text-slate-200 flex items-center justify-between">
                      <span>{skill.name}</span>
                      {skill.id.startsWith('custom_') && (
                        <button
                          onClick={() =>
                            setChar(prev => ({
                              ...prev,
                              skills: prev.skills.filter(s => s.id !== skill.id),
                            }))
                          }
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                    <td className="p-2 text-center text-slate-400">
                      <span>{skill.initValue}%</span>
                      {getSkillInitFormula(skill.id, char.edition) && (
                        <span className="block text-[9px] text-cyan-400 font-mono">
                          ({getSkillInitFormula(skill.id, char.edition)})
                        </span>
                      )}
                    </td>
                    <td className="p-1.5 text-center">
                      <input
                        type="number"
                        min="0"
                        value={skill.jobValue || ''}
                        onChange={e =>
                          handleSkillValueChange(skill.id, 'jobValue', parseInt(e.target.value, 10) || 0)
                        }
                        className="w-14 text-center px-1 py-1 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </td>
                    <td className="p-1.5 text-center">
                      <input
                        type="number"
                        min="0"
                        value={skill.hobbyValue || ''}
                        onChange={e =>
                          handleSkillValueChange(skill.id, 'hobbyValue', parseInt(e.target.value, 10) || 0)
                        }
                        className="w-14 text-center px-1 py-1 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </td>
                    <td className="p-1.5 text-center">
                      <input
                        type="number"
                        min="0"
                        value={skill.growthValue || ''}
                        onChange={e =>
                          handleSkillValueChange(skill.id, 'growthValue', parseInt(e.target.value, 10) || 0)
                        }
                        className="w-14 text-center px-1 py-1 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </td>
                    <td className="p-2 text-center font-bold text-sm text-emerald-400">
                      {total}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 自由技能追加フォーム */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
          <input
            type="text"
            placeholder="オリジナルの技能名"
            value={newSkillName}
            onChange={e => setNewSkillName(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 flex-1 min-w-[140px]"
          />
          <input
            type="number"
            placeholder="初期値"
            value={newSkillInit}
            onChange={e => setNewSkillInit(parseInt(e.target.value, 10) || 1)}
            className="w-16 px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 text-center focus:outline-none"
          />
          <button
            onClick={handleAddCustomSkill}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>追加</span>
          </button>
        </div>
      </div>

      {/* バックストーリー・創作補助 */}
      <div className="bg-slate-900/60 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>バックストーリー生成</span>
          </h3>
          <button
            onClick={handleGenerateAllBackstory}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-600/30 text-xs font-medium transition"
          >
            <Sparkles className="w-3 h-3" />
            <span>一括生成</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {[
            { key: 'personalDescription' as const, label: '容姿・外見の描写' },
            { key: 'ideology' as const, label: '信念・イデオロギー' },
            { key: 'significantPeople' as const, label: '大切な人・キーパーソン' },
            { key: 'meaningfulLocations' as const, label: '意味のある場所' },
            { key: 'treasuredPossessions' as const, label: '秘蔵の品・思い出の品' },
            { key: 'traits' as const, label: '特徴・日常の癖' },
          ].map(item => (
            <div key={item.key} className="bg-slate-950 p-2.5 sm:p-3 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300 text-[11px]">{item.label}</span>
                <button
                  onClick={() => handleGenerateBackstoryField(item.key)}
                  className="text-slate-400 hover:text-emerald-400 p-1 transition"
                  title="ランダム決定"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
              <textarea
                rows={2}
                value={char.backstory[item.key]}
                onChange={e =>
                  setChar({
                    ...char,
                    backstory: { ...char.backstory, [item.key]: e.target.value },
                  })
                }
                placeholder="クリックまたはランダムボタンで生成"
                className="w-full bg-transparent text-slate-200 text-xs border-0 focus:outline-none resize-none placeholder-slate-600 leading-relaxed"
              />
            </div>
          ))}
        </div>

        {/* 自由メモ */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
          <label className="block text-xs font-semibold text-slate-300">メモ・持ち物・呪文など</label>
          <textarea
            rows={3}
            value={char.memo}
            onChange={e => setChar({ ...char, memo: e.target.value })}
            placeholder="所持品、遭遇した神話生物、呪文、経歴などをご自由に記入"
            className="w-full bg-transparent text-slate-200 text-xs border-0 focus:outline-none resize-y placeholder-slate-600 leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};
