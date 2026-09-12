import React, { useState } from 'react';
import { Combatant } from '../../types/tools';
import { CharacterData } from '../../types/character';
import { 
  Swords, 
  Plus, 
  Trash2, 
  Check, 
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

  // 入力用
  const [newName, setNewName] = useState('');
  const [newDex, setNewDex] = useState(50);
  const [newHp, setNewHp] = useState(10);
  const [isEnemy, setIsEnemy] = useState(false);

  // DEX順にソート
  const sortedCombatants = [...combatants].sort((a, b) => b.dex - a.dex);

  // 追加
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

  // キャラクターからインポート
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

  // ターン進行
  const handleNextTurn = () => {
    if (sortedCombatants.length === 0) return;
    if (currentTurnIndex + 1 >= sortedCombatants.length) {
      // 次のラウンドへ
      setRound(prev => prev + 1);
      setCurrentTurnIndex(0);
      setCombatants(prev => prev.map(c => ({ ...c, hasActed: false })));
    } else {
      // 次のキャラクターへ
      const current = sortedCombatants[currentTurnIndex];
      setCombatants(prev => prev.map(c => c.id === current.id ? { ...c, hasActed: true } : c));
      setCurrentTurnIndex(prev => prev + 1);
    }
  };

  // ラウンドリセット
  const handleResetRound = () => {
    setRound(1);
    setCurrentTurnIndex(0);
    setCombatants(prev => prev.map(c => ({ ...c, hasActed: false })));
  };

  return (
    <div className="space-y-6">
      {/* 上部コントロール */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-950 border border-red-500/30 flex items-center justify-center text-red-400">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>戦闘ラウンド管理（DEXイニシアチブ）</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-950 border border-red-800 text-red-400">
                Round {round}
              </span>
            </h3>
            <p className="text-xs text-slate-400">DEX順に自動整列し、行動順とHPを追跡します</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleNextTurn}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-md shadow-emerald-950/40"
          >
            <span>次の行動へ</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetRound}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="ラウンド・行動済みをリセット"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 参加者追加フォーム */}
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <input
            type="text"
            placeholder="対象名（例: 佐藤、グール）"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 flex-1 min-w-[140px]"
          />
          <div className="flex items-center gap-1">
            <span className="text-slate-400">DEX:</span>
            <input
              type="number"
              value={newDex}
              onChange={e => setNewDex(parseInt(e.target.value, 10) || 0)}
              className="w-16 px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-center"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-400">HP:</span>
            <input
              type="number"
              value={newHp}
              onChange={e => setNewHp(parseInt(e.target.value, 10) || 0)}
              className="w-16 px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-center"
            />
          </div>
          <label className="flex items-center gap-1 text-slate-300 cursor-pointer px-2">
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
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>追加</span>
          </button>
        </div>

        {/* 保存済みキャラからのクイック追加 */}
        {characters.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 text-xs">
            <span className="text-slate-500">探索者リストから追加:</span>
            <div className="flex flex-wrap gap-1">
              {characters.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleImportFromChar(c)}
                  className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3 text-emerald-400" />
                  <span>{c.name || '探索者'} (DEX:{c.abilities.dex})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* イニシアチブ一覧 */}
      <div className="space-y-2">
        {sortedCombatants.map((c, index) => {
          const isCurrent = index === currentTurnIndex;
          return (
            <div
              key={c.id}
              className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-4 ${
                isCurrent
                  ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/40'
                  : c.hasActed
                  ? 'bg-slate-950/40 border-slate-900 opacity-60'
                  : 'bg-slate-900/70 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    c.isEnemy
                      ? 'bg-red-950 text-red-400 border border-red-800/60'
                      : 'bg-blue-950 text-blue-400 border border-blue-800/60'
                  }`}
                >
                  {c.isEnemy ? <Skull className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100">{c.name}</span>
                    <span className="text-xs px-2 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      DEX: {c.dex}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold animate-pulse">
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
                    placeholder="状態異常 / メモ"
                    className="text-xs text-slate-400 bg-transparent border-0 focus:outline-none focus:text-slate-200 mt-0.5"
                  />
                </div>
              </div>

              {/* HP操作 & アクション */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500">HP:</span>
                  <input
                    type="number"
                    value={c.hp}
                    onChange={e => {
                      const val = parseInt(e.target.value, 10) || 0;
                      setCombatants(prev => prev.map(item => item.id === c.id ? { ...item, hp: val } : item));
                    }}
                    className={`w-10 text-center font-bold bg-transparent focus:outline-none ${
                      c.hp <= 0 ? 'text-red-500' : 'text-slate-200'
                    }`}
                  />
                  <span className="text-slate-600">/ {c.maxHp}</span>
                </div>

                <button
                  onClick={() =>
                    setCombatants(prev =>
                      prev.map(item => item.id === c.id ? { ...item, hasActed: !item.hasActed } : item)
                    )
                  }
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    c.hasActed
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900'
                  }`}
                >
                  {c.hasActed ? '行動済' : '未行動'}
                </button>

                <button
                  onClick={() => setCombatants(prev => prev.filter(item => item.id !== c.id))}
                  className="p-1.5 rounded text-slate-500 hover:text-red-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
