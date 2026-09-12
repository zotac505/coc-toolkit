import React, { useState } from 'react';
import type { Combatant } from '../../types/tools';
import type { CharacterData } from '../../types/character';
import { 
  Swords, 
  Plus, 
  Trash2, 
  RotateCcw, 
  ChevronRight, 
  UserPlus,
  Shield,
  Skull
} from 'lucide-react';

interface DexInitiativeProps {
  characters: CharacterData[];
}

export const DexInitiative: React.FC<DexInitiativeProps> = ({ characters }) => {
  const [combatants, setCombatants] = useState<Combatant[]>([
    { id: 'c_1', name: '探索者A', dex: 65, hp: 12, maxHp: 12, isEnemy: false, statusText: '正常', hasActed: false },
    { id: 'c_2', name: '狂信者', dex: 50, hp: 9, maxHp: 9, isEnemy: true, statusText: '拳銃所持', hasActed: false },
  ]);

  const [round, setRound] = useState(1);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);

  const [newName, setNewName] = useState('');
  const [newDex, setNewDex] = useState(50);
  const [newHp, setNewHp] = useState(10);
  const [isEnemy, setIsEnemy] = useState(false);

  const sortedCombatants = [...combatants].sort((a, b) => b.dex - a.dex);

  const handleAdd = () => {
    if (!newName.trim()) return;
    const newItem: Combatant = {
      id: `combat_${Date.now()}`,
      name: newName.trim(),
      dex: newDex,
      hp: newHp,
      maxHp: newHp,
      isEnemy,
      statusText: '正常',
      hasActed: false,
    };
    setCombatants(prev => [...prev, newItem]);
    setNewName('');
  };

  const handleImportFromChar = (char: CharacterData) => {
    const newItem: Combatant = {
      id: `combat_char_${char.id}_${Date.now()}`,
      name: char.name || '探索者',
      dex: char.abilities.dex || 50,
      hp: char.hp || 10,
      maxHp: char.maxHp || 10,
      isEnemy: false,
      statusText: '正常',
      hasActed: false,
    };
    setCombatants(prev => [...prev, newItem]);
  };

  const handleNextTurn = () => {
    if (sortedCombatants.length === 0) return;
    if (currentTurnIndex + 1 >= sortedCombatants.length) {
      setRound(prev => prev + 1);
      setCurrentTurnIndex(0);
      setCombatants(prev => prev.map(c => ({ ...c, hasActed: false })));
    } else {
      const current = sortedCombatants[currentTurnIndex];
      setCombatants(prev => prev.map(c => c.id === current.id ? { ...c, hasActed: true } : c));
      setCurrentTurnIndex(prev => prev + 1);
    }
  };

  const handleResetRound = () => {
    setRound(1);
    setCurrentTurnIndex(0);
    setCombatants(prev => prev.map(c => ({ ...c, hasActed: false })));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 上部コントロール */}
      <div className="flex items-center justify-between gap-2 bg-slate-900/60 p-3.5 sm:p-5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-950 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <Swords className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-1.5">
              <span>戦闘ラウンド</span>
              <span className="text-[10px] sm:text-xs px-2 py-0.2 rounded-full bg-red-950 border border-red-800 text-red-400 font-normal">
                Round {round}
              </span>
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">DEX順に自動整列</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleNextTurn}
            className="flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-sm"
          >
            <span>次へ</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleResetRound}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="リセット"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 参加者追加フォーム */}
      <div className="bg-slate-900/50 p-3 sm:p-4 rounded-xl border border-slate-800 space-y-2.5">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 text-xs">
          <input
            type="text"
            placeholder="対象名（例: 探索者、怪異）"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="col-span-2 sm:col-span-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 flex-1 min-w-[120px]"
          />
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[11px]">DEX:</span>
            <input
              type="number"
              value={newDex}
              onChange={e => setNewDex(parseInt(e.target.value, 10) || 0)}
              className="w-14 px-1.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-center"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[11px]">HP:</span>
            <input
              type="number"
              value={newHp}
              onChange={e => setNewHp(parseInt(e.target.value, 10) || 0)}
              className="w-14 px-1.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-center"
            />
          </div>
          <label className="flex items-center gap-1 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isEnemy}
              onChange={e => setIsEnemy(e.target.checked)}
              className="rounded border-slate-800 bg-slate-900 text-red-500 focus:ring-0"
            />
            <span className={isEnemy ? 'text-red-400 font-bold' : ''}>エネミー</span>
          </label>
          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>追加</span>
          </button>
        </div>

        {/* 保存済みキャラからのクイック追加（横スクロールチップ） */}
        {characters.length > 0 && (
          <div className="pt-2 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] text-slate-500 shrink-0">キャラ呼出:</span>
            {characters.map(c => (
              <button
                key={c.id}
                onClick={() => handleImportFromChar(c)}
                className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs shrink-0 flex items-center gap-1"
              >
                <UserPlus className="w-3 h-3 text-emerald-400" />
                <span>{c.name || '探索者'}(DEX:{c.abilities.dex})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* イニシアチブ一覧 */}
      <div className="space-y-1.5 sm:space-y-2">
        {sortedCombatants.map((c, index) => {
          const isCurrent = index === currentTurnIndex;
          return (
            <div
              key={c.id}
              className={`p-2.5 sm:p-3.5 rounded-xl border transition flex items-center justify-between gap-2 sm:gap-4 ${
                isCurrent
                  ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/40'
                  : c.hasActed
                  ? 'bg-slate-950/40 border-slate-900 opacity-60'
                  : 'bg-slate-900/70 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    c.isEnemy
                      ? 'bg-red-950 text-red-400 border border-red-800/60'
                      : 'bg-blue-950 text-blue-400 border border-blue-800/60'
                  }`}
                >
                  {c.isEnemy ? <Skull className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm text-slate-100 truncate">{c.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      DEX:{c.dex}
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-bold animate-pulse">
                        手番中
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={c.statusText}
                    onChange={e => {
                      const val = e.target.value;
                      setCombatants(prev => prev.map(item => item.id === c.id ? { ...item, statusText: val } : item));
                    }}
                    placeholder="状態 / メモ"
                    className="text-[11px] text-slate-400 bg-transparent border-0 focus:outline-none focus:text-slate-200 w-full"
                  />
                </div>
              </div>

              {/* HP操作 & アクション */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <div className="flex items-center gap-0.5 text-xs bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px]">HP:</span>
                  <input
                    type="number"
                    value={c.hp}
                    onChange={e => {
                      const val = parseInt(e.target.value, 10) || 0;
                      setCombatants(prev => prev.map(item => item.id === c.id ? { ...item, hp: val } : item));
                    }}
                    className={`w-8 text-center font-bold bg-transparent focus:outline-none ${
                      c.hp <= 0 ? 'text-red-500' : 'text-slate-200'
                    }`}
                  />
                  <span className="text-slate-600 text-[10px]">/{c.maxHp}</span>
                </div>

                <button
                  onClick={() =>
                    setCombatants(prev =>
                      prev.map(item => item.id === c.id ? { ...item, hasActed: !item.hasActed } : item)
                    )
                  }
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition ${
                    c.hasActed
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900'
                  }`}
                >
                  {c.hasActed ? '済' : '未'}
                </button>

                <button
                  onClick={() => setCombatants(prev => prev.filter(item => item.id !== c.id))}
                  className="p-1 rounded text-slate-500 hover:text-red-400 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
