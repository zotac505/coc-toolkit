import React, { useState } from 'react';
import { HandoutItem } from '../../types/scenario';
import { Plus, Trash2, Copy, Check, Lock, Unlock, Mail } from 'lucide-react';

export const HandoutGenerator: React.FC = () => {
  const [handouts, setHandouts] = useState<HandoutItem[]>([
    {
      id: 'ho_gen_1',
      title: 'HO1：探偵事務所の主宰',
      publicInfo: '街で小さな探偵事務所を構えている。依頼人からの奇妙な依頼を受け、仲間たちと共に調査を開始する。',
      secretInfo: '【秘密情報】依頼人から手渡された前金の封筒の中に、あなたの古い筆跡で「逃げろ」と書かれたメモが同封されていた。',
      assignedTo: 'プレイヤーA',
    },
    {
      id: 'ho_gen_2',
      title: 'HO2：警察関係者 / 鑑識',
      publicInfo: '今回の事件に関わる公式の記録や鑑識情報にアクセスできる立場にある。',
      secretInfo: '【秘密情報】上層部から「これ以上の深入りは無用にせよ」と非公式の圧力を受けている。',
      assignedTo: 'プレイヤーB',
    },
  ]);

  const [openSecrets, setOpenSecrets] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAdd = () => {
    const newHo: HandoutItem = {
      id: `ho_gen_${Date.now()}`,
      title: `HO${handouts.length + 1}：`,
      publicInfo: '',
      secretInfo: '',
      assignedTo: '',
    };
    setHandouts(prev => [...prev, newHo]);
  };

  const copyForPlayer = async (ho: HandoutItem) => {
    const text = [
      `=============================`,
      `【${ho.title}】（担当: ${ho.assignedTo || '未定'}）`,
      `-----------------------------`,
      `◆ 公開情報:`,
      ho.publicInfo || 'なし',
      `-----------------------------`,
      `◆ 秘密情報 (他言無用):`,
      ho.secretInfo || 'なし',
      `=============================`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(ho.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-xl border border-slate-800">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>ハンドアウト（HO）カード ＆ PL個別配布ツール</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            公開情報と秘匿情報をカードで整理し、Discordやココフォリアの個別チャット送信用に整形コピーできます
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
        >
          <Plus className="w-4 h-4" />
          <span>新しいHOを追加</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {handouts.map((ho, index) => (
          <div key={ho.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                value={ho.title}
                onChange={e => {
                  const updated = [...handouts];
                  updated[index].title = e.target.value;
                  setHandouts(updated);
                }}
                className="font-bold text-sm bg-transparent text-slate-100 border-b border-slate-800 focus:outline-none focus:border-emerald-500 flex-1"
              />

              <input
                type="text"
                placeholder="担当PL名"
                value={ho.assignedTo || ''}
                onChange={e => {
                  const updated = [...handouts];
                  updated[index].assignedTo = e.target.value;
                  setHandouts(updated);
                }}
                className="text-xs bg-slate-900 px-2 py-1 rounded border border-slate-800 text-slate-300 w-28 text-center"
              />

              <button
                onClick={() => setHandouts(prev => prev.filter(h => h.id !== ho.id))}
                className="p-1 text-slate-500 hover:text-red-400 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* 公開情報 */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">公開情報</label>
              <textarea
                rows={3}
                value={ho.publicInfo}
                onChange={e => {
                  const updated = [...handouts];
                  updated[index].publicInfo = e.target.value;
                  setHandouts(updated);
                }}
                placeholder="全員に共有可能な背景や設定"
                className="w-full p-2.5 bg-slate-900/50 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-y"
              />
            </div>

            {/* 秘密情報 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-amber-400 font-semibold">秘密情報（秘匿）</label>
                <button
                  onClick={() =>
                    setOpenSecrets(prev => ({ ...prev, [ho.id]: !prev[ho.id] }))
                  }
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
                >
                  {openSecrets[ho.id] ? <Unlock className="w-3 h-3 text-amber-400" /> : <Lock className="w-3 h-3" />}
                  <span>{openSecrets[ho.id] ? '隠す' : '表示'}</span>
                </button>
              </div>

              {openSecrets[ho.id] ? (
                <textarea
                  rows={3}
                  value={ho.secretInfo}
                  onChange={e => {
                    const updated = [...handouts];
                    updated[index].secretInfo = e.target.value;
                    setHandouts(updated);
                  }}
                  placeholder="このPLだけが知る使命や過去のトラウマ"
                  className="w-full p-2.5 bg-amber-950/20 border border-amber-900/40 rounded-lg text-xs text-amber-200 focus:outline-none focus:border-amber-500 resize-y"
                />
              ) : (
                <div
                  onClick={() => setOpenSecrets(prev => ({ ...prev, [ho.id]: true }))}
                  className="p-3 bg-slate-900/30 border border-slate-800/80 rounded-lg text-center text-slate-500 text-xs cursor-pointer hover:bg-slate-900/60 transition"
                >
                  <Lock className="w-3.5 h-3.5 mx-auto mb-1 text-slate-600" />
                  <span>クリックして秘密情報を表示・編集</span>
                </div>
              )}
            </div>

            {/* 配信用テキストコピー */}
            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => copyForPlayer(ho)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800/60 text-xs font-medium transition"
              >
                {copiedId === ho.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === ho.id ? 'PL送信用にコピー完了！' : 'PL送信用テキストをコピー'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
