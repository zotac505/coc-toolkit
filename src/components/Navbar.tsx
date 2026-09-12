import React from 'react';
import { Skull, BookOpen, Users, Wrench } from 'lucide-react';

export type TabType = 'characters' | 'scenarios' | 'tools';

interface NavbarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
  return (
    <>
      {/* 上部ヘッダー（PC・スマホ共通） */}
      <header className="border-b border-slate-800/80 bg-slate-900/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* ロゴ */}
            <div
              className="flex items-center space-x-2.5 cursor-pointer select-none"
              onClick={() => onTabChange('characters')}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-950/50">
                <Skull className="w-5 h-5" />
              </div>
              <div>
                <div className="text-base sm:text-lg font-bold tracking-wide text-slate-100 flex items-center gap-1.5">
                  <span>CoC Toolkit</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-600/40 text-emerald-400 font-normal">
                    6th / 7th
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">クトゥルフTRPG プレイ＆セッション総合支援</p>
              </div>
            </div>

            {/* PC用タブナビゲーション（md以上で表示） */}
            <nav className="hidden md:flex space-x-2">
              <button
                onClick={() => onTabChange('characters')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentTab === 'characters'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>キャラクリ / 管理</span>
              </button>

              <button
                onClick={() => onTabChange('scenarios')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentTab === 'scenarios'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>シナリオ集</span>
              </button>

              <button
                onClick={() => onTabChange('tools')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentTab === 'tools'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Wrench className="w-4 h-4" />
                <span>KPツール</span>
              </button>
            </nav>

            {/* GitHubリンク */}
            <div className="flex items-center">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-slate-200 p-2 rounded-lg hover:bg-slate-800 transition"
                title="GitHubで公開する"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* スマホ用固定ボトムナビゲーションバー（md未満で表示） */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-2 pb-safe">
        <div className="grid grid-cols-3 h-14">
          <button
            onClick={() => onTabChange('characters')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              currentTab === 'characters'
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px]">キャラクリ</span>
          </button>

          <button
            onClick={() => onTabChange('scenarios')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              currentTab === 'scenarios'
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px]">シナリオ集</span>
          </button>

          <button
            onClick={() => onTabChange('tools')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              currentTab === 'tools'
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-5 h-5" />
            <span className="text-[10px]">KPツール</span>
          </button>
        </div>
      </nav>
    </>
  );
};
