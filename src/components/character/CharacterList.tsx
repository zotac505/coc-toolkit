import React, { useState, useRef } from 'react';
import type { CharacterData, RuleEdition } from '../../types/character';
import { copyCCfoliaDataToClipboard } from '../../utils/ccfolia';
import { saveCharacterToGitHub } from '../../utils/githubSync';
import { downloadJsonFile } from '../../utils/storage';
import { 
  Plus, 
  Copy, 
  Trash2, 
  Download, 
  Upload, 
  Check, 
  FileText,
  Heart,
  Zap,
  Brain,
  CloudUpload
} from 'lucide-react';

interface CharacterListProps {
  characters: CharacterData[];
  onSelectCharacter: (char: CharacterData) => void;
  onCreateNew: (edition: RuleEdition) => void;
  onDeleteCharacter: (id: string) => void;
  onDuplicateCharacter: (char: CharacterData) => void;
  onImportCharacters: (imported: CharacterData[]) => void;
}

export const CharacterList: React.FC<CharacterListProps> = ({
  characters,
  onSelectCharacter,
  onCreateNew,
  onDeleteCharacter,
  onDuplicateCharacter,
  onImportCharacters,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopyCCfolia = async (e: React.MouseEvent, char: CharacterData) => {
    e.stopPropagation();
    const success = await copyCCfoliaDataToClipboard(char);
    if (success) {
      setCopiedId(char.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const list = Array.isArray(parsed) ? parsed : [parsed];
        onImportCharacters(list);
      } catch (err) {
        alert('ファイルの読み込みに失敗しました。正しいJSONファイルか確認してください。');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20">
      {/* 上部ヘッダー・アクション */}
      <div className="bg-slate-900/60 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100">キャラクター管理</h2>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              探索者シートの作成・編集、ココフォリア用コマ出力
            </p>
          </div>
        </div>

        {/* アクションボタン群（スマホ対応） */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>インポート</span>
          </button>

          {/* 新規作成 (6版 / 7版) */}
          <div className="flex-1 flex items-center rounded-lg bg-emerald-600 hover:bg-emerald-500 transition shadow-sm overflow-hidden">
            <button
              onClick={() => onCreateNew('6th')}
              className="flex-1 flex items-center justify-center gap-1 py-2 text-white text-xs font-semibold border-r border-emerald-500/50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新規作成 (6版)</span>
            </button>
            <button
              onClick={() => onCreateNew('7th')}
              className="px-3.5 py-2 text-white text-xs font-semibold hover:bg-emerald-700/60 transition"
              title="第7版で新規作成"
            >
              7版
            </button>
          </div>
        </div>
      </div>

      {/* キャラクター一覧 */}
      {characters.length === 0 ? (
        <div className="text-center py-12 sm:py-16 px-4 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800 space-y-2">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-medium text-slate-300">保存された探索者はいません</p>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            上の「新規作成」ボタンから探索者シートを作成してみましょう。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {characters.map(char => (
            <div
              key={char.id}
              onClick={() => onSelectCharacter(char)}
              className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-3.5 sm:p-4 transition cursor-pointer flex flex-col justify-between shadow-sm"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm sm:text-base text-slate-100 truncate">
                        {char.name || '名称未設定'}
                      </h3>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-slate-400 shrink-0">
                        {char.edition === '6th' ? '6版' : '7版'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {char.job || '職業未設定'} / {char.age ? `${char.age}歳` : '-'} / {char.gender || '-'}
                    </p>
                  </div>
                </div>

                {/* ステータスバッジ */}
                <div className="grid grid-cols-3 gap-1.5 bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 text-center">
                  <div className="flex items-center justify-center gap-1 text-[11px]">
                    <Heart className="w-3 h-3 text-red-400" />
                    <span className="text-slate-300 font-semibold">{char.hp}/{char.maxHp}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-[11px]">
                    <Zap className="w-3 h-3 text-blue-400" />
                    <span className="text-slate-300 font-semibold">{char.mp}/{char.maxMp}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-[11px]">
                    <Brain className="w-3 h-3 text-purple-400" />
                    <span className="text-slate-300 font-semibold">{char.san}</span>
                  </div>
                </div>
              </div>

              {/* カード下部アクション */}
              <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={e => handleCopyCCfolia(e, char)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-700/50 text-xs font-medium transition"
                  title="ココフォリア駒データをコピー"
                >
                  {copiedId === char.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedId === char.id ? 'コピー済' : 'ココフォリア駒'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={async e => {
                      e.stopPropagation();
                      const res = await saveCharacterToGitHub(char);
                      alert(res.message);
                    }}
                    className="p-1.5 rounded-md hover:bg-slate-800 text-purple-400 hover:text-purple-300 transition"
                    title="GitHubリポジトリへ保存（他端末と同期）"
                  >
                    <CloudUpload className="w-4 h-4" />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      downloadJsonFile(`${char.name || '探索者'}.json`, char);
                    }}
                    className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                    title="JSON書き出し"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onDuplicateCharacter(char);
                    }}
                    className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                    title="複製"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (confirm(`「${char.name || '名称未設定'}」を削除しますか？`)) {
                        onDeleteCharacter(char.id);
                      }
                    }}
                    className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-red-400 transition"
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
