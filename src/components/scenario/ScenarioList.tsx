import React, { useState, useMemo } from 'react';
import type { ScenarioData } from '../../types/scenario';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Clock, 
  Users, 
  MapPin, 
  Tag
} from 'lucide-react';

interface ScenarioListProps {
  scenarios: ScenarioData[];
  onSelectScenario: (scenario: ScenarioData) => void;
  onCreateNew: () => void;
}

export const ScenarioList: React.FC<ScenarioListProps> = ({
  scenarios,
  onSelectScenario,
  onCreateNew,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSetting, setSelectedSetting] = useState<string>('all');
  const [selectedLostRate, setSelectedLostRate] = useState<string>('all');

  // フィルタリング処理
  const filteredScenarios = useMemo(() => {
    return scenarios.filter(s => {
      const matchesSearch = 
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesSetting = 
        selectedSetting === 'all' || s.setting.includes(selectedSetting);

      const matchesLostRate = 
        selectedLostRate === 'all' || s.lostRate === selectedLostRate;

      return matchesSearch && matchesSetting && matchesLostRate;
    });
  }, [scenarios, searchTerm, selectedSetting, selectedLostRate]);

  const getLostRateBadge = (rate: ScenarioData['lostRate']) => {
    switch (rate) {
      case 'low':
        return <span className="px-2 py-0.5 rounded text-[10px] sm:text-xs bg-emerald-950 text-emerald-400 border border-emerald-800">ロスト: 低</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[10px] sm:text-xs bg-amber-950 text-amber-400 border border-amber-800">ロスト: 中</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[10px] sm:text-xs bg-red-950 text-red-400 border border-red-800">ロスト: 高</span>;
      case 'very_high':
        return <span className="px-2 py-0.5 rounded text-[10px] sm:text-xs bg-purple-950 text-purple-400 border border-purple-800">ロスト: 極高</span>;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20">
      {/* 上部ヘッダー */}
      <div className="flex items-center justify-between gap-2 bg-slate-900/60 p-4 sm:p-5 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-1.5">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <span>シナリオ集</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            セッション用シナリオ閲覧・KPネタバレ管理
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-sm shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>新規作成</span>
        </button>
      </div>

      {/* 検索・絞り込みフィルター */}
      <div className="bg-slate-900/50 p-3 sm:p-4 rounded-xl border border-slate-800 space-y-2">
        {/* キーワード検索 */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="タイトル・タグ・キーワードで検索..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* 舞台・ロスト率フィルター（横2列） */}
        <div className="grid grid-cols-2 gap-2">
          <select
            value={selectedSetting}
            onChange={e => setSelectedSetting(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">舞台: すべて</option>
            <option value="現代日本">現代日本</option>
            <option value="洋館">洋館・クローズド</option>
            <option value="繁華街">都市・繁華街</option>
            <option value="1920">1920年代</option>
          </select>

          <select
            value={selectedLostRate}
            onChange={e => setSelectedLostRate(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">ロスト率: すべて</option>
            <option value="low">ロスト率: 低</option>
            <option value="medium">ロスト率: 中</option>
            <option value="high">ロスト率: 高</option>
          </select>
        </div>
      </div>

      {/* シナリオ一覧 */}
      {filteredScenarios.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
          <p className="text-xs sm:text-sm text-slate-400">該当するシナリオが見つかりませんでした。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {filteredScenarios.map(scenario => (
            <div
              key={scenario.id}
              onClick={() => onSelectScenario(scenario)}
              className="bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-4 transition cursor-pointer flex flex-col justify-between shadow-sm"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-emerald-400 transition">
                    {scenario.title}
                  </h3>
                  {getLostRateBadge(scenario.lostRate)}
                </div>

                {scenario.catchphrase && (
                  <p className="text-[11px] sm:text-xs italic text-emerald-400 font-medium">
                    {scenario.catchphrase}
                  </p>
                )}

                <p className="text-xs text-slate-300 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                  {scenario.summary}
                </p>

                {/* メタ情報 */}
                <div className="grid grid-cols-3 gap-1.5 text-[10px] sm:text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{scenario.players}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{scenario.playTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{scenario.setting}</span>
                  </div>
                </div>

                {/* タグ */}
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {scenario.tags.map(t => (
                    <span
                      key={t}
                      className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      <span>{t}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800/70 flex items-center justify-between text-xs text-slate-500">
                <span className="text-[11px]">作者: {scenario.author || '不明'}</span>
                <span className="text-emerald-400 font-medium text-xs">
                  詳細・KPモード →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
