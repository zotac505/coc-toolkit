import React, { useState } from 'react';
import { ScenarioData } from '../../types/scenario';
import { downloadJsonFile } from '../../utils/storage';
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Clock, 
  Users, 
  MapPin, 
  ShieldAlert, 
  Download, 
  Edit3, 
  Trash2,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ScenarioViewerProps {
  scenario: ScenarioData;
  onBack: () => void;
  onEdit: (scenario: ScenarioData) => void;
  onDelete: (id: string) => void;
}

export const ScenarioViewer: React.FC<ScenarioViewerProps> = ({
  scenario,
  onBack,
  onEdit,
  onDelete,
}) => {
  const [isKpMode, setIsKpMode] = useState(false);
  const [openSpoilers, setOpenSpoilers] = useState<Record<string, boolean>>({});
  const [openSecrets, setOpenSecrets] = useState<Record<string, boolean>>({});
  const [copiedSectionId, setCopiedSectionId] = useState<string | null>(null);

  const toggleSpoiler = (id: string) => {
    setOpenSpoilers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSecret = (id: string) => {
    setOpenSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSectionId(id);
      setTimeout(() => setCopiedSectionId(null), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* ナビゲーションバー */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="戻る"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-100">{scenario.title}</h2>
            <p className="text-xs text-slate-400">作者: {scenario.author || '不明'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* KPモード切替ボタン */}
          <button
            onClick={() => setIsKpMode(!isKpMode)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition shadow-md ${
              isKpMode
                ? 'bg-amber-600 text-white shadow-amber-950/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            {isKpMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>{isKpMode ? 'KPモード: ON（真相表示）' : 'KPモード: OFF（PL向け）'}</span>
          </button>

          {/* JSON保存 */}
          <button
            onClick={() => downloadJsonFile(`${scenario.title}.json`, scenario)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="JSON形式でダウンロード"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* 編集 */}
          <button
            onClick={() => onEdit(scenario)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="シナリオを編集"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* 削除 */}
          <button
            onClick={() => {
              if (confirm(`シナリオ「${scenario.title}」を削除しますか？`)) {
                onDelete(scenario.id);
              }
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-red-300 transition"
            title="削除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 概要カード */}
      <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800 space-y-4">
        {scenario.catchphrase && (
          <p className="text-sm font-semibold italic text-emerald-400">
            {scenario.catchphrase}
          </p>
        )}

        <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
          {scenario.summary}
        </p>

        {/* スペック */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block mb-1">推奨人数</span>
            <span className="font-semibold text-slate-200">{scenario.players}</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block mb-1">プレイ時間</span>
            <span className="font-semibold text-slate-200">{scenario.playTime}</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block mb-1">舞台設定</span>
            <span className="font-semibold text-slate-200">{scenario.setting}</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block mb-1">推奨技能</span>
            <span className="font-semibold text-emerald-400">
              {scenario.recommendedSkills.join(', ') || '特になし'}
            </span>
          </div>
        </div>
      </div>

      {/* KP向け真相（KPモードON時のみ） */}
      {isKpMode && scenario.truth && (
        <div className="bg-red-950/30 border border-red-800/50 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>【ネタバレ注意】KP向けシナリオの真相</span>
            </h3>
            <button
              onClick={() => copyText('truth', scenario.truth)}
              className="flex items-center gap-1 text-xs text-red-300 hover:text-white px-2 py-1 rounded bg-red-900/40"
            >
              {copiedSectionId === 'truth' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>コピー</span>
            </button>
          </div>
          <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
            {scenario.truth}
          </p>
        </div>
      )}

      {/* ハンドアウト（HO） */}
      {scenario.handouts.length > 0 && (
        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
            ハンドアウト（HO）
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenario.handouts.map(ho => (
              <div key={ho.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-100">{ho.title}</h4>
                  <button
                    onClick={() =>
                      copyText(
                        ho.id,
                        `【${ho.title}】\n${ho.publicInfo}${
                          openSecrets[ho.id] ? `\n\n${ho.secretInfo}` : ''
                        }`
                      )
                    }
                    className="text-slate-400 hover:text-slate-200 p-1"
                    title="HOテキストをコピー"
                  >
                    {copiedSectionId === ho.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded border border-slate-800/80">
                  <span className="text-[10px] uppercase text-emerald-400 font-bold block mb-1">
                    公開情報
                  </span>
                  {ho.publicInfo}
                </div>

                {/* 秘密情報（トグル） */}
                {ho.secretInfo && (
                  <div>
                    <button
                      onClick={() => toggleSecret(ho.id)}
                      className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 py-1 transition"
                    >
                      {openSecrets[ho.id] ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      <span>{openSecrets[ho.id] ? '秘密情報を閉じる' : '秘密情報を開く'}</span>
                    </button>

                    {openSecrets[ho.id] && (
                      <div className="mt-2 text-xs text-amber-200/90 leading-relaxed bg-amber-950/30 p-3 rounded border border-amber-900/50">
                        <span className="text-[10px] uppercase text-amber-400 font-bold block mb-1">
                          秘密情報
                        </span>
                        {ho.secretInfo}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* セクション（導入・イベント・クライマックス等） */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
          シナリオ進行 ＆ 描写テキスト
        </h3>

        {scenario.sections.map(sec => {
          const isHidden = sec.isSpoiler && !isKpMode && !openSpoilers[sec.id];
          return (
            <div
              key={sec.id}
              className={`bg-slate-900/60 rounded-xl border transition ${
                sec.isSpoiler ? 'border-amber-900/40' : 'border-slate-800'
              }`}
            >
              <div className="p-4 flex items-center justify-between border-b border-slate-800/70">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-100">{sec.title}</h4>
                  {sec.isSpoiler && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                      ネタバレ / ギミック
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyText(sec.id, sec.content)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800"
                    title="描写テキストをコピー"
                  >
                    {copiedSectionId === sec.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>コピー</span>
                  </button>

                  {sec.isSpoiler && !isKpMode && (
                    <button
                      onClick={() => toggleSpoiler(sec.id)}
                      className="p-1 text-slate-400 hover:text-slate-200"
                    >
                      {openSpoilers[sec.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4">
                {isHidden ? (
                  <div
                    onClick={() => toggleSpoiler(sec.id)}
                    className="text-center py-6 cursor-pointer text-xs text-amber-400/80 hover:text-amber-300 bg-amber-950/20 rounded-lg border border-dashed border-amber-900/40"
                  >
                    <Lock className="w-4 h-4 mx-auto mb-1" />
                    <span>ネタバレを含むセクションです。クリックして展開するか、KPモードをONにしてください。</span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                    {sec.content}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
