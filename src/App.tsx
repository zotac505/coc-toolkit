import React, { useState, useEffect } from 'react';
import { Navbar, TabType } from './components/Navbar';
import { CharacterList } from './components/character/CharacterList';
import { CharacterEditor } from './components/character/CharacterEditor';
import { ScenarioList } from './components/scenario/ScenarioList';
import { ScenarioViewer } from './components/scenario/ScenarioViewer';
import { ScenarioEditor } from './components/scenario/ScenarioEditor';
import { KpToolsHub } from './components/tools/KpToolsHub';
import { CharacterData, RuleEdition } from './types/character';
import { ScenarioData } from './types/scenario';
import { createNewCharacter } from './utils/characterCalc';
import { 
  loadCharacters, 
  saveCharacter, 
  deleteCharacter, 
  loadScenarios, 
  saveScenario, 
  deleteScenario 
} from './utils/storage';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('characters');

  // キャラクター関連State
  const [characters, setCharacters] = useState<CharacterData[]>([]);
  const [editingCharacter, setEditingCharacter] = useState<CharacterData | null>(null);

  // シナリオ関連State
  const [scenarios, setScenarios] = useState<ScenarioData[]>([]);
  const [viewingScenario, setViewingScenario] = useState<ScenarioData | null>(null);
  const [editingScenario, setEditingScenario] = useState<ScenarioData | null>(null);
  const [isCreatingScenario, setIsCreatingScenario] = useState(false);

  // 初期ロード
  useEffect(() => {
    setCharacters(loadCharacters());
    setScenarios(loadScenarios());
  }, []);

  // --- キャラクターハンドラ ---
  const handleSaveCharacter = (char: CharacterData) => {
    saveCharacter(char);
    setCharacters(loadCharacters());
    setEditingCharacter(null);
  };

  const handleDeleteCharacter = (id: string) => {
    deleteCharacter(id);
    setCharacters(loadCharacters());
  };

  const handleCreateNewCharacter = (edition: RuleEdition) => {
    const newChar = createNewCharacter(edition);
    setEditingCharacter(newChar);
  };

  const handleDuplicateCharacter = (char: CharacterData) => {
    const duplicated: CharacterData = {
      ...char,
      id: `char_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: `${char.name || '探索者'}のコピー`,
      updatedAt: new Date().toISOString(),
    };
    saveCharacter(duplicated);
    setCharacters(loadCharacters());
  };

  const handleImportCharacters = (imported: CharacterData[]) => {
    imported.forEach(c => saveCharacter(c));
    setCharacters(loadCharacters());
  };

  // --- シナリオハンドラ ---
  const handleSaveScenario = (scenario: ScenarioData) => {
    saveScenario(scenario);
    setScenarios(loadScenarios());
    setEditingScenario(null);
    setIsCreatingScenario(false);
    setViewingScenario(scenario);
  };

  const handleDeleteScenario = (id: string) => {
    deleteScenario(id);
    setScenarios(loadScenarios());
    setViewingScenario(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar currentTab={currentTab} onTabChange={(tab) => {
        setCurrentTab(tab);
        setEditingCharacter(null);
        setViewingScenario(null);
        setEditingScenario(null);
        setIsCreatingScenario(false);
      }} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
        {/* キャラクター管理タブ */}
        {currentTab === 'characters' && (
          <div>
            {editingCharacter ? (
              <CharacterEditor
                initialCharacter={editingCharacter}
                onSave={handleSaveCharacter}
                onCancel={() => setEditingCharacter(null)}
              />
            ) : (
              <CharacterList
                characters={characters}
                onSelectCharacter={char => setEditingCharacter(char)}
                onCreateNew={handleCreateNewCharacter}
                onDeleteCharacter={handleDeleteCharacter}
                onDuplicateCharacter={handleDuplicateCharacter}
                onImportCharacters={handleImportCharacters}
              />
            )}
          </div>
        )}

        {/* シナリオ集タブ */}
        {currentTab === 'scenarios' && (
          <div>
            {editingScenario || isCreatingScenario ? (
              <ScenarioEditor
                initialScenario={editingScenario || undefined}
                onSave={handleSaveScenario}
                onCancel={() => {
                  setEditingScenario(null);
                  setIsCreatingScenario(false);
                }}
              />
            ) : viewingScenario ? (
              <ScenarioViewer
                scenario={viewingScenario}
                onBack={() => setViewingScenario(null)}
                onEdit={scen => setEditingScenario(scen)}
                onDelete={handleDeleteScenario}
              />
            ) : (
              <ScenarioList
                scenarios={scenarios}
                onSelectScenario={scen => setViewingScenario(scen)}
                onCreateNew={() => setIsCreatingScenario(true)}
              />
            )}
          </div>
        )}

        {/* KPツールタブ */}
        {currentTab === 'tools' && <KpToolsHub characters={characters} />}
      </main>

      {/* フッター */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>
            CoC Toolkit - クトゥルフTRPG (第6版 / 第7版) プレイ・セッション総合支援Webサイト
          </p>
          <p className="text-[11px] text-slate-600">
            本作は、「株式会社アークライト」及び「株式会社KADOKAWA」が権利を有する『クトゥルフ神話TRPG』の二次創作・サポート支援ツールです。(C) Chaosium Inc. / Arclight Inc. / KADOKAWA
          </p>
        </div>
      </footer>
    </div>
  );
};
export default App;
