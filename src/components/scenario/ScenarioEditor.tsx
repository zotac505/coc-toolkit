import React, { useState } from 'react';
import { ScenarioData, ScenarioSection, HandoutItem } from '../../types/scenario';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  FileText,
  AlertCircle
} from 'lucide-react';

interface ScenarioEditorProps {
  initialScenario?: ScenarioData;
  onSave: (scenario: ScenarioData) => void;
  onCancel: () => void;
}

export const ScenarioEditor: React.FC<ScenarioEditorProps> = ({
  initialScenario,
  onSave,
  onCancel,
}) => {
  const [data, setData] = useState<ScenarioData>(() => {
    if (initialScenario) return initialScenario;
    return {
      id: `scen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: '',
      author: '',
      edition: 'both',
      players: '2〜4人',
      playTime: '3〜4時間',
      setting: '現代日本',
      lostRate: 'medium',
      recommendedSkills: ['目星', '聞き耳', '図書館'],
      tags: ['現代日本', '初心者向け'],
      catchphrase: '',
      summary: '',
      truth: '',
      handouts: [],
      sections: [
        {
          id: `sec_${Date.now()}_1`,
          title: '導入：事件の始まり',
          type: 'intro',
          isSpoiler: false,
          content: '',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  const [skillsInput, setSkillsInput] = useState(data.recommendedSkills.join(', '));
  const [tagsInput, setTagsInput] = useState(data.tags.join(', '));

  // HO追加
  const handleAddHandout = () => {
    const newHo: HandoutItem = {
      id: `ho_${Date.now()}`,
      title: `HO${data.handouts.length + 1}`,
      publicInfo: '',
      secretInfo: '',
    };
    setData(prev => ({ ...prev, handouts: [...prev.handouts, newHo] }));
  };

  // セクション追加
  const handleAddSection = () => {
    const newSec: ScenarioSection = {
      id: `sec_${Date.now()}`,
      title: '新しいセクション',
      type: 'event',
      isSpoiler: false,
      content: '',
    };
    setData(prev => ({ ...prev, sections: [...prev.sections, newSec] }));
  };

  const handleSave = () => {
    if (!data.title.trim()) {
      alert('シナリオタイトルを入力してください');
      return;
    }

    const updated = {
      ...data,
      recommendedSkills: skillsInput.split(',').map(s => s.trim()).filter(Boolean),
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      updatedAt: new Date().toISOString(),
    };
    onSave(updated);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* 上部アクションバー */}
      <div className="flex items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-100">
              {data.title || '新しいシナリオ'}
            </h2>
            <p className="text-xs text-slate-400">シナリオ作成 ＆ 執筆</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition shadow-lg shadow-emerald-950/40"
        >
          <Save className="w-4 h-4" />
          <span>保存する</span>
        </button>
      </div>

      {/* 基本情報フォーム */}
      <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
          基本情報
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">シナリオタイトル *</label>
            <input
              type="text"
              value={data.title}
              onChange={e => setData({ ...data, title: e.target.value })}
              placeholder="例: 深紅の夜啼き鳥"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">作者名</label>
            <input
              type="text"
              value={data.author}
              onChange={e => setData({ ...data, author: e.target.value })}
              placeholder="例: あなたのお名前"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">キャッチコピー</label>
            <input
              type="text"
              value={data.catchphrase}
              onChange={e => setData({ ...data, catchphrase: e.target.value })}
              placeholder="例: 『森の奥に佇む館で、毎夜響く鳴き声の正体とは――』"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-slate-400 mb-1">推奨人数</label>
              <input
                type="text"
                value={data.players}
                onChange={e => setData({ ...data, players: e.target.value })}
                placeholder="2〜4人"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">プレイ時間</label>
              <input
                type="text"
                value={data.playTime}
                onChange={e => setData({ ...data, playTime: e.target.value })}
                placeholder="3〜4時間"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">ロスト率</label>
              <select
                value={data.lostRate}
                onChange={e => setData({ ...data, lostRate: e.target.value as any })}
                className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
                <option value="very_high">極高</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">舞台設定</label>
            <input
              type="text"
              value={data.setting}
              onChange={e => setData({ ...data, setting: e.target.value })}
              placeholder="例: 現代日本、1920s アメリカ"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">推奨技能 (カンマ区切り)</label>
            <input
              type="text"
              value={skillsInput}
              onChange={e => setSkillsInput(e.target.value)}
              placeholder="目星, 聞き耳, 図書館, 回避"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">タグ (カンマ区切り)</label>
          <input
            type="text"
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            placeholder="クローズド, ホラー, 初心者向け"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">あらすじ・概要</label>
          <textarea
            rows={3}
            value={data.summary}
            onChange={e => setData({ ...data, summary: e.target.value })}
            placeholder="プレイヤーに公開するシナリオのあらすじを記入してください"
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-emerald-500 resize-y"
          />
        </div>

        {/* 真相 */}
        <div>
          <label className="block text-xs text-red-400 mb-1 font-bold">
            【KP専用】シナリオの真相（黒幕・怪異の正体・クリア条件など）
          </label>
          <textarea
            rows={4}
            value={data.truth}
            onChange={e => setData({ ...data, truth: e.target.value })}
            placeholder="KPだけが閲覧するシナリオの背景や真実、怪異の正体を記入してください"
            className="w-full p-3 bg-slate-950 border border-red-900/40 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-red-500 resize-y"
          />
        </div>
      </div>

      {/* ハンドアウト（HO） */}
      <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
            ハンドアウト（HO）
          </h3>
          <button
            onClick={handleAddHandout}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>HO追加</span>
          </button>
        </div>

        {data.handouts.map((ho, index) => (
          <div key={ho.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={ho.title}
                onChange={e => {
                  const updated = [...data.handouts];
                  updated[index].title = e.target.value;
                  setData({ ...data, handouts: updated });
                }}
                className="bg-transparent font-bold text-xs text-slate-100 border-b border-slate-800 focus:border-emerald-500 focus:outline-none pb-1 w-48"
              />
              <button
                onClick={() =>
                  setData({
                    ...data,
                    handouts: data.handouts.filter((_, i) => i !== index),
                  })
                }
                className="text-red-400 hover:text-red-300 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1">公開情報</label>
              <textarea
                rows={2}
                value={ho.publicInfo}
                onChange={e => {
                  const updated = [...data.handouts];
                  updated[index].publicInfo = e.target.value;
                  setData({ ...data, handouts: updated });
                }}
                placeholder="全員に公開される探索者の立場や共通情報"
                className="w-full p-2 bg-slate-900/50 border border-slate-800 rounded text-slate-200 text-xs focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-amber-400 mb-1">秘密情報（秘匿HO）</label>
              <textarea
                rows={2}
                value={ho.secretInfo}
                onChange={e => {
                  const updated = [...data.handouts];
                  updated[index].secretInfo = e.target.value;
                  setData({ ...data, handouts: updated });
                }}
                placeholder="該当PLのみが知る使命や過去の出来事"
                className="w-full p-2 bg-slate-900/50 border border-amber-900/40 rounded text-slate-200 text-xs focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>
          </div>
        ))}
      </div>

      {/* シナリオ進行セクション */}
      <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
            進行セクション（導入・イベント・クライマックス）
          </h3>
          <button
            onClick={handleAddSection}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>セクション追加</span>
          </button>
        </div>

        {data.sections.map((sec, index) => (
          <div key={sec.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                value={sec.title}
                onChange={e => {
                  const updated = [...data.sections];
                  updated[index].title = e.target.value;
                  setData({ ...data, sections: updated });
                }}
                placeholder="セクション名（例: 導入、怪異の発生、決戦）"
                className="bg-transparent font-bold text-xs text-slate-100 border-b border-slate-800 focus:border-emerald-500 focus:outline-none pb-1 flex-1"
              />

              <label className="flex items-center gap-1.5 text-xs text-amber-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sec.isSpoiler}
                  onChange={e => {
                    const updated = [...data.sections];
                    updated[index].isSpoiler = e.target.checked;
                    setData({ ...data, sections: updated });
                  }}
                  className="rounded border-slate-800 bg-slate-900 text-amber-500 focus:ring-0"
                />
                <span>ネタバレ・ギミック</span>
              </label>

              <button
                onClick={() =>
                  setData({
                    ...data,
                    sections: data.sections.filter((_, i) => i !== index),
                  })
                }
                className="text-red-400 hover:text-red-300 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <textarea
              rows={4}
              value={sec.content}
              onChange={e => {
                const updated = [...data.sections];
                updated[index].content = e.target.value;
                setData({ ...data, sections: updated });
              }}
              placeholder="描写テキスト、判定条件、イベント内容などを記入してください"
              className="w-full p-2.5 bg-slate-900/50 border border-slate-800 rounded text-slate-200 text-xs focus:outline-none focus:border-emerald-500 resize-y"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
