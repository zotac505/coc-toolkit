import React, { useState } from 'react';
import type { CharacterData } from '../../types/character';
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
    <div className="space-y-4 sm:space-y-6 pb-20">
      {/* ツール切り替えタブ（スマホでは横スクロール可能） */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 border-b border-slate-800">
        <button
          onClick={() => setActiveSubTab('dice')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition shrink-0 ${
            activeSubTab === 'dice'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Dices className="w-3.5 h-3.5" />
          <span>ダイスボット</span>
        </button>

        <button
          onClick={() => setActiveSubTab('san')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition shrink-0 ${
            activeSubTab === 'san'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>SAN・狂気判定</span>
        </button>

        <button
          onClick={() => setActiveSubTab('combat')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition shrink-0 ${
            activeSubTab === 'combat'
              ? 'bg-red-700 text-white shadow-sm'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          <span>戦闘ラウンド (DEX)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('handout')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition shrink-0 ${
            activeSubTab === 'handout'
              ? 'bg-cyan-700 text-white shadow-sm'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>HO管理</span>
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
