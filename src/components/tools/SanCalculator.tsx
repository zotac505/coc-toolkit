import React, { useState } from 'react';
import { SHORT_TERM_MADNESS, LONG_TERM_MADNESS, PHOBIA_SAMPLES, MANIA_SAMPLES } from '../../data/madnessTables';
import { getRandomItem } from '../../data/backstoryGenerators';
import { roll } from '../../utils/dice';
import { Brain, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';
import { MadnessEntry } from '../../types/tools';

export const SanCalculator: React.FC = () => {
  const [currentSan, setCurrentSan] = useState(50);
  const [sanLoss, setSanLoss] = useState(5);
  const [dayLossTotal, setDayLossTotal] = useState(0);

  const [lastMadness, setLastMadness] = useState<{
    type: string;
    entry: MadnessEntry | null;
    extra?: string;
  } | null>(null);

  // 一時的狂気（1回で5以上減少）
  const isTemporaryMadness = sanLoss >= 5;
  // 不定の狂気（セッション中の合計が現在SANの1/5以上減少）
  const indefiniteThreshold = Math.floor(currentSan / 5);
  const isIndefiniteMadness = dayLossTotal + sanLoss >= indefiniteThreshold;

  // 短期狂気表ロール
  const handleRollShortTerm = () => {
    const rolledNum = roll(10, 1)[0];
    const entry = SHORT_TERM_MADNESS.find(m => m.number === rolledNum) || SHORT_TERM_MADNESS[0];
    setLastMadness({
      type: '一時的狂気（短期・戦闘中）',
      entry,
    });
  };

  // 長期狂気表ロール
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

  // 減少を適用
  const handleApplyLoss = () => {
    setCurrentSan(prev => Math.max(0, prev - sanLoss));
    setDayLossTotal(prev => prev + sanLoss);
  };

  return (
    <div className="space-y-6">
      {/* 入力と判定 */}
      <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
          <Brain className="w-4 h-4" />
          <span>SAN値チェック ＆ 狂気判定計算機</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <label className="block text-xs text-slate-400 mb-1">現在のSAN値</label>
            <input
              type="number"
              min="0"
              max="99"
              value={currentSan}
              onChange={e => setCurrentSan(parseInt(e.target.value, 10) || 0)}
              className="w-full text-center text-xl font-bold bg-transparent text-purple-400 focus:outline-none"
            />
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <label className="block text-xs text-slate-400 mb-1">今回の減少値</label>
            <input
              type="number"
              min="0"
              value={sanLoss}
              onChange={e => setSanLoss(parseInt(e.target.value, 10) || 0)}
              className="w-full text-center text-xl font-bold bg-transparent text-red-400 focus:outline-none"
            />
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <label className="block text-xs text-slate-400 mb-1">本日/セッション累計減少</label>
            <div className="text-center text-xl font-bold text-amber-400 py-0.5">
              {dayLossTotal}
            </div>
          </div>
        </div>

        {/* 判定アラート */}
        <div className="space-y-2">
          {isTemporaryMadness && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800 text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                <strong>一時的狂気のアラート:</strong> 1回で5ポイント以上のSANが減少しました。《アイデア》ロールに成功すると一時的狂気に陥ります。
              </span>
            </div>
          )}

          {isIndefiniteMadness && (
            <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-800 text-xs text-purple-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                <strong>不定の狂気のアラート:</strong> 累計減少がSANの1/5（{indefiniteThreshold}pt）に達しました。長期的・不定の狂気に陥ります。
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={handleApplyLoss}
            className="px-4 py-2 rounded-lg bg-red-800 hover:bg-red-700 text-white text-xs font-semibold transition"
          >
            SAN減少を反映（残: {Math.max(0, currentSan - sanLoss)}）
          </button>
          <button
            onClick={() => setDayLossTotal(0)}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
          >
            累計減少をリセット
          </button>
        </div>
      </div>

      {/* 狂気表ランダムロール */}
      <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>狂気表ダイスロール</span>
        </h3>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleRollShortTerm}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-900/40 hover:bg-red-900/70 text-red-200 border border-red-700/50 text-xs font-medium transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>短期狂気表を振る (1D10ラウンド)</span>
          </button>

          <button
            onClick={handleRollLongTerm}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-900/40 hover:bg-purple-900/70 text-purple-200 border border-purple-700/50 text-xs font-medium transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>長期・不定の狂気表を振る (1D10×10時間)</span>
          </button>
        </div>

        {/* 結果表示 */}
        {lastMadness && lastMadness.entry && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 mt-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs text-purple-400 font-bold">{lastMadness.type}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                期間: {lastMadness.entry.duration}
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-100">
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
