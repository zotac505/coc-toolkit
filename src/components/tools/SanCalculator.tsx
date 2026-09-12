import React, { useState } from 'react';
import { SHORT_TERM_MADNESS, LONG_TERM_MADNESS, PHOBIA_SAMPLES, MANIA_SAMPLES } from '../../data/madnessTables';
import { getRandomItem } from '../../data/backstoryGenerators';
import { roll } from '../../utils/dice';
import { Brain, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';
import type { MadnessEntry } from '../../types/tools';

export const SanCalculator: React.FC = () => {
  const [currentSan, setCurrentSan] = useState(50);
  const [sanLoss, setSanLoss] = useState(5);
  const [dayLossTotal, setDayLossTotal] = useState(0);

  const [lastMadness, setLastMadness] = useState<{
    type: string;
    entry: MadnessEntry | null;
    extra?: string;
  } | null>(null);

  const isTemporaryMadness = sanLoss >= 5;
  const indefiniteThreshold = Math.floor(currentSan / 5);
  const isIndefiniteMadness = dayLossTotal + sanLoss >= indefiniteThreshold;

  const handleRollShortTerm = () => {
    const rolledNum = roll(10, 1)[0];
    const entry = SHORT_TERM_MADNESS.find(m => m.number === rolledNum) || SHORT_TERM_MADNESS[0];
    setLastMadness({
      type: '一時的狂気（短期・戦闘中）',
      entry,
    });
  };

  const handleRollLongTerm = () => {
    const rolledNum = roll(10, 1)[0];
    const entry = LONG_TERM_MADNESS.find(m => m.number === rolledNum) || LONG_TERM_MADNESS[0];
    let extra = '';
    if (rolledNum === 4) {
      extra = `【恐怖症】: ${getRandomItem(PHOBIA_SAMPLES)}`;
    } else if (rolledNum === 5) {
      extra = `【マニア・偏執癖】: ${getRandomItem(MANIA_SAMPLES)}`;
    }
    setLastMadness({
      type: '不定の狂気 / 長期狂気',
      entry,
      extra,
    });
  };

  const handleApplyLoss = () => {
    setCurrentSan(prev => Math.max(0, prev - sanLoss));
    setDayLossTotal(prev => prev + sanLoss);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 入力と判定 */}
      <div className="bg-slate-900/60 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-3">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
          <Brain className="w-4 h-4" />
          <span>SAN値チェック ＆ 狂気判定</span>
        </h3>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-950 p-2 sm:p-3 rounded-lg border border-slate-800 text-center">
            <label className="block text-[10px] sm:text-xs text-slate-400 mb-0.5">現在SAN</label>
            <input
              type="number"
              min="0"
              max="99"
              value={currentSan}
              onChange={e => setCurrentSan(parseInt(e.target.value, 10) || 0)}
              className="w-full text-center text-lg sm:text-xl font-bold bg-transparent text-purple-400 focus:outline-none"
            />
          </div>

          <div className="bg-slate-950 p-2 sm:p-3 rounded-lg border border-slate-800 text-center">
            <label className="block text-[10px] sm:text-xs text-slate-400 mb-0.5">今回減少</label>
            <input
              type="number"
              min="0"
              value={sanLoss}
              onChange={e => setSanLoss(parseInt(e.target.value, 10) || 0)}
              className="w-full text-center text-lg sm:text-xl font-bold bg-transparent text-red-400 focus:outline-none"
            />
          </div>

          <div className="bg-slate-950 p-2 sm:p-3 rounded-lg border border-slate-800 text-center">
            <label className="block text-[10px] sm:text-xs text-slate-400 mb-0.5">累計減少</label>
            <div className="text-center text-lg sm:text-xl font-bold text-amber-400 py-0.5">
              {dayLossTotal}
            </div>
          </div>
        </div>

        {/* 判定アラート */}
        <div className="space-y-1.5">
          {isTemporaryMadness && (
            <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800 text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                <strong>一時的狂気:</strong> 5以上減少。《アイデア》成功で狂気発症。
              </span>
            </div>
          )}

          {isIndefiniteMadness && (
            <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-800 text-xs text-purple-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                <strong>不定の狂気:</strong> 累計減少がSANの1/5（{indefiniteThreshold}pt）に到達。
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={handleApplyLoss}
            className="flex-1 py-2 px-3 rounded-lg bg-red-800 hover:bg-red-700 text-white text-xs font-semibold transition text-center"
          >
            減少を適用 (残: {Math.max(0, currentSan - sanLoss)})
          </button>
          <button
            onClick={() => setDayLossTotal(0)}
            className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
          >
            リセット
          </button>
        </div>
      </div>

      {/* 狂気表ランダムロール */}
      <div className="bg-slate-900/60 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-3">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          <span>狂気表ダイス</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={handleRollShortTerm}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-red-900/40 hover:bg-red-900/70 text-red-200 border border-red-700/50 text-xs font-medium transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>短期狂気表 (1D10ラウンド)</span>
          </button>

          <button
            onClick={handleRollLongTerm}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-purple-900/40 hover:bg-purple-900/70 text-purple-200 border border-purple-700/50 text-xs font-medium transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>長期・不定狂気表 (1D10×10時間)</span>
          </button>
        </div>

        {/* 結果表示 */}
        {lastMadness && lastMadness.entry && (
          <div className="bg-slate-950 p-3.5 sm:p-4 rounded-xl border border-slate-800 space-y-1.5 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-purple-400 font-bold">{lastMadness.type}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                {lastMadness.entry.duration}
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-slate-100">
              【{lastMadness.entry.number}】 {lastMadness.entry.title}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {lastMadness.entry.description}
            </p>
            {lastMadness.extra && (
              <p className="text-xs font-semibold text-amber-400 pt-1">
                {lastMadness.extra}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
