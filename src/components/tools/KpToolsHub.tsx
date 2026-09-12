import React, { useState } from 'react';
import { CharacterData } from '../../types/character';
import { SanCalculator } from './SanCalculator';
import { DexInitiative } from './DexInitiative';
import { DiceRoller } from './DiceRoller';
import { HandoutGenerator } from './HandoutGenerator';
import { Brain, Swords, Dices, Mail } from 'lucide-react';

interface KpToolsHubProps {
  characters: CharacterData[];
}

export const KpToolsHub: React.FC<KpToolsHubProps> = ({ characters }) => {
  const [activeSubTab, setActiveSubTab] = useState<'dice' | 'san' | 'combat' | 'handout'>('dice');

  return (
    <div className="space-y-6">
      {/* ツール切り替えタブ */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('dice')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'dice'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Dices className="w-4 h-4" />
          <span>ダイスボット (1D100 / シークレット)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('san')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'san'
              ? 'bg-purple-700 text-white shadow-md shadow-purple-950/40'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>SANチェック ＆ 狂気判定</span>
        </button>

        <button
          onClick={() => setActiveSubTab('combat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'combat'
              ? 'bg-red-700 text-white shadow-md shadow-red-950/40'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Swords className="w-4 h-4" />
          <span>戦闘ラウンド (DEX順)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('handout')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'handout'
              ? 'bg-cyan-700 text-white shadow-md shadow-cyan-950/40'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>ハンドアウト (HO) 管理</span>
        </button>
      </div>

      {/* サブタブコンテンツ */}
      {activeSubTab === 'dice' && <DiceRoller />}
      {activeSubTab === 'san' && <SanCalculator />}
      {activeSubTab === 'combat' && <DexInitiative characters={characters} />}
      {activeSubTab === 'handout' && <HandoutGenerator />}
    </div>
  );
};
