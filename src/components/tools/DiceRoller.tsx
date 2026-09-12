import React, { useState } from 'react';
import { evaluate1D100, rollFormula } from '../../utils/dice';
import { DiceRollResult } from '../../types/tools';
import { RuleEdition } from '../../types/character';
import { 
  Dices, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Sparkles, 
  History,
  CheckCircle2,
  XCircle,
  AlertOctagon
} from 'lucide-react';

export const DiceRoller: React.FC = () => {
  const [edition, setEdition] = useState<RuleEdition>('6th');
  const [targetValue, setTargetValue] = useState<number>(50);
  const [skillLabel, setSkillLabel] = useState<string>('目星');
  const [customFormula, setCustomFormula] = useState<string>('1D6');
  const [isSecret, setIsSecret] = useState<boolean>(false);
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});

  const [history, setHistory] = useState<DiceRollResult[]>([]);

  // 1D100 判定ロール
  const handleRoll1D100 = () => {
    const result = evaluate1D100(targetValue, edition, skillLabel);
    result.isSecret = isSecret;
    setHistory(prev => [result, ...prev.slice(0, 29)]);
  };

  // 汎用ダイスロール
  const handleRollFormula = (formula: string, label?: string) => {
    const result = rollFormula(formula, label);
    result.isSecret = isSecret;
    setHistory(prev => [result, ...prev.slice(0, 29)]);
  };

  // 判定バッジ
  const renderJudgmentBadge = (judgment?: DiceRollResult['judgment']) => {
    if (!judgment) return null;
    switch (judgment) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-950 text-amber-300 border border-amber-500 animate-pulse">
            決定的成功 (Critical!)
          </span>
        );
      case 'special':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500">
            スペシャル成功
          </span>
        );
      case 'extreme_success':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-950 text-purple-300 border border-purple-500">
            イクストリーム成功
          </span>
        );
      case 'hard_success':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-950 text-blue-300 border border-blue-500">
            ハード成功
          </span>
        );
      case 'success':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-950 text-emerald-400 border border-emerald-800">
            成功
          </span>
        );
      case 'fumble':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-950 text-red-400 border border-red-500 animate-bounce">
            致命的失敗 (Fumble!)
          </span>
        );
      case 'failure':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-400">
            失敗
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1D100 技能・能力値ロール */}
      <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Dices className="w-4 h-4" />
            <span>1D100 判定ダイス</span>
          </h3>

          <div className="flex items-center gap-2">
            {/* シークレットダイストグル */}
            <button
              onClick={() => setIsSecret(!isSecret)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                isSecret
                  ? 'bg-purple-900 text-purple-200 border border-purple-600'
                  : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              {isSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>シークレットダイス: {isSecret ? 'ON' : 'OFF'}</span>
            </button>

            {/* ルール切り替え */}
            <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex text-xs">
              <button
                onClick={() => setEdition('6th')}
                className={`px-2.5 py-1 rounded transition ${
                  edition === '6th' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400'
                }`}
              >
                6版判定
              </button>
              <button
                onClick={() => setEdition('7th')}
                className={`px-2.5 py-1 rounded transition ${
                  edition === '7th' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400'
                }`}
              >
                7版判定
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">技能/判定名</label>
            <input
              type="text"
              value={skillLabel}
              onChange={e => setSkillLabel(e.target.value)}
              placeholder="例: 目星, アイデア, 回避"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">目標値 (目標成功率 %)</label>
            <input
              type="number"
              min="1"
              max="100"
              value={targetValue}
              onChange={e => setTargetValue(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-center font-bold text-emerald-400 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRoll1D100}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-1.5"
            >
              <Dices className="w-4 h-4" />
              <span>1D100 をロール</span>
            </button>
          </div>
        </div>
      </div>

      {/* 汎用クイックダイス */}
      <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
          クイックダイス ＆ ダメージロール
        </h3>

        <div className="flex flex-wrap gap-2">
          {['1D3', '1D4', '1D6', '2D6', '3D6', '1D10', '1D100', '2D6+6'].map(formula => (
            <button
              key={formula}
              onClick={() => handleRollFormula(formula, formula)}
              className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg border border-slate-800 transition"
            >
              {formula}
            </button>
          ))}
        </div>

        {/* 自由ダイス式 */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-xs">
          <input
            type="text"
            value={customFormula}
            onChange={e => setCustomFormula(e.target.value)}
            placeholder="例: 1D10+2, 4D6"
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 w-36 text-center font-mono"
          />
          <button
            onClick={() => handleRollFormula(customFormula, 'カスタムロール')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition"
          >
            ロール
          </button>
        </div>
      </div>

      {/* ダイス履歴ログ */}
      <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <History className="w-4 h-4" />
            <span>ダイスログ (直近30件)</span>
          </h3>
          {history.length > 0 && (
            <button
              onClick={() => setHistory([])}
              className="text-xs text-slate-500 hover:text-slate-300 transition"
            >
              ログ消去
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">まだダイス履歴はありません。</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {history.map(item => {
              const isHidden = item.isSecret && !revealedSecrets[item.id];
              return (
                <div
                  key={item.id}
                  className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-mono">{item.timestamp}</span>
                    <span className="font-semibold text-slate-200">{item.label || item.formula}</span>
                    {item.target && (
                      <span className="text-slate-400"> (目標: {item.target})</span>
                    )}
                    {item.isSecret && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                        シークレット
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {isHidden ? (
                      <button
                        onClick={() => setRevealedSecrets(prev => ({ ...prev, [item.id]: true }))}
                        className="flex items-center gap-1 text-purple-400 hover:text-purple-300 bg-purple-950/40 px-2 py-1 rounded border border-purple-800/40"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>結果を見る</span>
                      </button>
                    ) : (
                      <>
                        <div className="font-mono font-bold text-base text-emerald-400">
                          {item.total}
                        </div>
                        {renderJudgmentBadge(item.judgment)}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
