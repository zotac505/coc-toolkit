import React, { useState } from 'react';
import type { ScenarioData } from '../../types/scenario';
import { downloadJsonFile } from '../../utils/storage';
import { saveScenarioToGitHub } from '../../utils/githubSync';
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  ShieldAlert, 
  Download, 
  Edit3, 
  Trash2,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  CloudUpload
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
    <div className="space-y-4 sm:space-y-6 pb-20">
      {/* ナビゲーションバー */}
      <div className="bg-slate-900/90 p-3 sm:p-4 rounded-xl border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onBack}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition shrink-0"
              title="戻る"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="truncate">
              <h2 className="text-base sm:text-xl font-bold text-slate-100 truncate">{scenario.title}</h2>
              <p className="text-[10px] sm:text-xs text-slate-400">作者: {scenario.author || '不明'}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={async () => {
                const res = await saveScenarioToGitHub(scenario);
                alert(res.message);
              }}
              className="p-1.5 sm:p-2 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-300 transition"
              title="GitHubリポジトリへ保存（他端末と同期）"
            >
              <CloudUpload className="w-4 h-4" />
            </button>
            <button
              onClick={() => downloadJsonFile(`${scenario.title}.json`, scenario)}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="JSON保存"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(scenario)}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="編集"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (confirm(`シナリオ「${scenario.title}」を削除しますか？\n（リポジトリのまとめファイルからも削除同期されます）`)) {
                  onDelete(scenario.id);
                }
              }}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-red-300 transition"
              title="削除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* KPモード切替バー */}
        <div className="pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setIsKpMode(!isKpMode)}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition shadow-sm ${
              isKpMode
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            {isKpMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>{isKpMode ? 'KPモード: ON（真相とギミック全表示）' : 'KPモード: OFF（プレイヤー向け表示）'}</span>
          </button>
        </div>
      </div>

      {/* 概要カード */}
      <div className="bg-slate-900/60 p-4 sm:p-6 rounded-xl border border-slate-800 space-y-3">
        {scenario.catchphrase && (
          <p className="text-xs sm:text-sm font-semibold italic text-emerald-400">
            {scenario.catchphrase}
          </p>
        )}

        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
          {scenario.summary}
        </p>

        {/* スペック */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] block">推奨人数</span>
            <span className="font-semibold text-slate-200 text-xs">{scenario.players}</span>
          </div>
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] block">プレイ時間</span>
            <span className="font-semibold text-slate-200 text-xs">{scenario.playTime}</span>
          </div>
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] block">舞台設定</span>
            <span className="font-semibold text-slate-200 text-xs truncate block">{scenario.setting}</span>
          </div>
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] block">推奨技能</span>
            <span className="font-semibold text-emerald-400 text-xs truncate block">
              {scenario.recommendedSkills.join(', ') || '特になし'}
            </span>
          </div>
        </div>
      </div>

      {/* KP向け真相（KPモードON時のみ） */}
      {isKpMode && scenario.truth && (
        <div className="bg-red-950/30 border border-red-800/50 rounded-xl p-4 sm:p-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-red-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>【ネタバレ注意】KP向け真相</span>
            </h3>
            <button
              onClick={() => copyText('truth', scenario.truth)}
              className="flex items-center gap-1 text-[11px] text-red-300 hover:text-white px-2 py-1 rounded bg-red-900/40"
            >
              {copiedSectionId === 'truth' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
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
        <div className="bg-slate-900/60 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-3">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-400">
            ハンドアウト（HO）
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {scenario.handouts.map(ho => (
              <div key={ho.id} className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-100">{ho.title}</h4>
                  <button
                    onClick={() =>
                      copyText(
                        ho.id,
                        `【${ho.title}】\n${ho.publicInfo}${
                          openSecrets[ho.id] ? `\n\n${ho.secretInfo}` : ''
                        }`
                      )
                    }
                    className="p-1.5 rounded bg-slate-900 text-slate-400 hover:text-slate-200"
                    title="HOテキストをコピー"
                  >
                    {copiedSectionId === ho.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-2.5 rounded border border-slate-800/80">
                  <span className="text-[10px] uppercase text-emerald-400 font-bold block mb-0.5">
                    公開情報
                  </span>
                  {ho.publicInfo}
                </div>

                {/* 秘密情報 */}
                {ho.secretInfo && (
                  <div>
                    <button
                      onClick={() => toggleSecret(ho.id)}
                      className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 py-1"
                    >
                      {openSecrets[ho.id] ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      <span>{openSecrets[ho.id] ? '秘密を隠す' : '秘密を見る'}</span>
                    </button>

                    {openSecrets[ho.id] && (
                      <div className="mt-1 text-xs text-amber-200/90 leading-relaxed bg-amber-950/30 p-2.5 rounded border border-amber-900/50">
                        <span className="text-[10px] uppercase text-amber-400 font-bold block mb-0.5">
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

      {/* セクション（導入・描写・クライマックス等） */}
      <div className="space-y-3">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-400">
          進行セクション ＆ 描写テキスト
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
              <div className="p-3 sm:p-4 flex items-center justify-between border-b border-slate-800/70 gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-100 truncate">{sec.title}</h4>
                  {sec.isSpoiler && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800 shrink-0">
                      ネタバレ
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => copyText(sec.id, sec.content)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800"
                    title="描写テキストをコピー"
                  >
                    {copiedSectionId === sec.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span className="hidden sm:inline">コピー</span>
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

              <div className="p-3 sm:p-4">
                {isHidden ? (
                  <div
                    onClick={() => toggleSpoiler(sec.id)}
                    className="text-center py-5 cursor-pointer text-xs text-amber-400/80 hover:text-amber-300 bg-amber-950/20 rounded-lg border border-dashed border-amber-900/40 px-2"
                  >
                    <Lock className="w-4 h-4 mx-auto mb-1" />
                    <span>ネタバレを含むセクションです。タップして展開</span>
                  </div>
                ) : (
                  <div className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
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
