import React, { useState, useEffect } from 'react';
import { loadGitHubConfig, saveGitHubConfig, type GitHubConfig } from '../utils/githubSync';
import { X, Check, Key, Shield, ExternalLink } from 'lucide-react';

interface SyncSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncSettingsModal: React.FC<SyncSettingsModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<GitHubConfig>(loadGitHubConfig());
  const [saved, setSaved] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfig(loadGitHubConfig());
      setSaved(false);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveGitHubConfig(config);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  const handleTestConnection = async () => {
    if (!config.token.trim()) {
      setTestResult({ success: false, message: 'トークンを入力してください' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}`, {
        headers: {
          Authorization: `token ${config.token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (res.ok) {
        setTestResult({ success: true, message: '接続成功！リポジトリへのアクセス権限が確認できました。' });
      } else {
        const data = await res.json().catch(() => ({}));
        setTestResult({ success: false, message: `接続失敗 (${res.status}): ${data.message || '権限またはリポジトリ名を確認してください'}` });
      }
    } catch (e: any) {
      setTestResult({ success: false, message: `エラー: ${e.message || String(e)}` });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">GitHub クラウド同期設定</h3>
              <p className="text-[11px] text-slate-400">キャラやシナリオをリポジトリへ自動保存</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* セキュリティ案内 */}
        <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            トークンはお使いのブラウザ内（LocalStorage）にのみ安全に保存され、外部サーバーに送信されることはありません。
          </span>
        </div>

        {/* 設定入力フォーム */}
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 mb-1">GitHub ユーザー名 / Owner</label>
              <input
                type="text"
                value={config.owner}
                onChange={e => setConfig({ ...config, owner: e.target.value })}
                placeholder="zotac505"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">リポジトリ名</label>
              <input
                type="text"
                value={config.repo}
                onChange={e => setConfig({ ...config, repo: e.target.value })}
                placeholder="coc-toolkit"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-400">Personal Access Token (classic)</label>
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>トークン発行ページ</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={config.token}
              onChange={e => setConfig({ ...config, token: e.target.value })}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              ※権限は「repo（リポジトリの読み書き）」にチェックを入れたトークンが必要です。
            </p>
          </div>

          {/* テスト接続結果 */}
          {testResult && (
            <div
              className={`p-2.5 rounded-lg border text-xs ${
                testResult.success
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : 'bg-red-950/40 border-red-800 text-red-300'
              }`}
            >
              {testResult.message}
            </div>
          )}
        </div>

        {/* ボタン群 */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition disabled:opacity-50"
          >
            {isTesting ? 'テスト接続中...' : '接続テスト'}
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-md shadow-emerald-950/40"
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : null}
            <span>{saved ? '設定を保存しました！' : '設定を保存'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
