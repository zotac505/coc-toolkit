import type { CharacterData } from '../types/character';
import type { ScenarioData } from '../types/scenario';

const GITHUB_CONFIG_KEY = 'coc_toolkit_github_config_v1';
const DELETED_IDS_KEY = 'coc_toolkit_deleted_ids_v1';

export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
}

export const loadGitHubConfig = (): GitHubConfig => {
  try {
    const raw = localStorage.getItem(GITHUB_CONFIG_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse github config', e);
  }
  return {
    owner: 'zotac505',
    repo: 'coc-toolkit',
    branch: 'main',
    token: '',
  };
};

export const saveGitHubConfig = (config: GitHubConfig): void => {
  localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(config));
};

// 削除済みID管理（他端末やリロード時のゾンビ復活防止）
export const getDeletedIds = (): string[] => {
  try {
    const raw = localStorage.getItem(DELETED_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const recordDeletedId = (id: string): void => {
  const ids = getDeletedIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(ids));
  }
};

export const unrecordDeletedId = (id: string): void => {
  const ids = getDeletedIds().filter(existing => existing !== id);
  localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(ids));
};

// UTF-8対応の確実なBase64エンコード
const toBase64 = (str: string): string => {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Base64デコード
const fromBase64 = (base64: string): string => {
  const clean = base64.replace(/[\r\n\s]/g, '');
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder('utf-8').decode(bytes);
};

interface GitHubFileResponse {
  sha: string;
  content: string;
}

// --- リポジトリへの保存・追記 ---
export const syncItemToGitHub = async <T extends { id: string }>(
  filePath: string,
  item: T,
  commitMessage: string
): Promise<{ success: boolean; message: string }> => {
  const config = loadGitHubConfig();
  if (!config.token.trim()) {
    return {
      success: false,
      message: 'GitHub APIトークンが未設定です。右上の「同期設定（歯車）」からトークンを入力してください。',
    };
  }

  const timestamp = Date.now();
  const getUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}?ref=${config.branch}&_nocache=${timestamp}`;
  const putUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`;

  const authHeader = config.token.startsWith('Bearer ') || config.token.startsWith('token ')
    ? config.token
    : `Bearer ${config.token}`;

  try {
    let sha: string | undefined = undefined;
    let currentList: T[] = [];

    const getRes = await fetch(getUrl, {
      headers: {
        Authorization: authHeader,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      cache: 'no-store',
    });

    if (getRes.ok) {
      const data: GitHubFileResponse = await getRes.json();
      sha = data.sha;
      try {
        const decoded = fromBase64(data.content);
        currentList = JSON.parse(decoded);
      } catch (err) {
        currentList = [];
      }
    } else if (getRes.status === 404) {
      currentList = [];
    } else {
      const errData = await getRes.json().catch(() => ({}));
      return {
        success: false,
        message: `ファイルの取得に失敗しました [HTTP ${getRes.status}]: ${errData.message || ''}`,
      };
    }

    // 削除済みリストから除外（再保存された場合）
    unrecordDeletedId(item.id);

    const index = currentList.findIndex(existing => existing.id === item.id);
    if (index >= 0) {
      currentList[index] = item;
    } else {
      currentList.unshift(item);
    }

    const updatedJsonString = JSON.stringify(currentList, null, 2);
    const contentBase64 = toBase64(updatedJsonString);

    const putBody: any = {
      message: commitMessage,
      content: contentBase64,
      branch: config.branch,
    };
    if (sha) {
      putBody.sha = sha;
    }

    const putRes = await fetch(putUrl, {
      method: 'PUT',
      headers: {
        Authorization: authHeader,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify(putBody),
    });

    if (putRes.ok) {
      return {
        success: true,
        message: 'リポジトリへの保存（自動コミット）に成功しました！数分で全端末に同期されます。',
      };
    } else {
      const errData = await putRes.json().catch(() => ({}));
      return {
        success: false,
        message: `コミットの送信に失敗しました [HTTP ${putRes.status}]: ${errData.message || '不明なエラー'}`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `通信エラー: ${err.message || String(err)}`,
    };
  }
};

// --- リポジトリからの削除同期 ---
export const removeItemFromGitHub = async <T extends { id: string }>(
  filePath: string,
  itemId: string,
  commitMessage: string
): Promise<{ success: boolean; message: string }> => {
  const config = loadGitHubConfig();
  if (!config.token.trim()) {
    // トークン未設定時はローカル削除のみ
    recordDeletedId(itemId);
    return {
      success: true,
      message: 'ローカルから削除しました（GitHubトークンが未設定のためリポジトリへの反映はスキップされました）。',
    };
  }

  const timestamp = Date.now();
  const getUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}?ref=${config.branch}&_nocache=${timestamp}`;
  const putUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`;

  const authHeader = config.token.startsWith('Bearer ') || config.token.startsWith('token ')
    ? config.token
    : `Bearer ${config.token}`;

  try {
    let sha: string | undefined = undefined;
    let currentList: T[] = [];

    const getRes = await fetch(getUrl, {
      headers: {
        Authorization: authHeader,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      cache: 'no-store',
    });

    if (getRes.ok) {
      const data: GitHubFileResponse = await getRes.json();
      sha = data.sha;
      try {
        const decoded = fromBase64(data.content);
        currentList = JSON.parse(decoded);
      } catch (err) {
        currentList = [];
      }
    } else {
      recordDeletedId(itemId);
      return { success: false, message: 'リポジトリファイルの取得に失敗しました。' };
    }

    // アイテムをリストから除外
    const initialLen = currentList.length;
    currentList = currentList.filter(existing => existing.id !== itemId);
    recordDeletedId(itemId);

    if (currentList.length === initialLen) {
      // リポジトリに元々存在していなかった場合
      return { success: true, message: '削除を反映しました。' };
    }

    const updatedJsonString = JSON.stringify(currentList, null, 2);
    const contentBase64 = toBase64(updatedJsonString);

    const putBody: any = {
      message: commitMessage,
      content: contentBase64,
      branch: config.branch,
      sha,
    };

    const putRes = await fetch(putUrl, {
      method: 'PUT',
      headers: {
        Authorization: authHeader,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify(putBody),
    });

    if (putRes.ok) {
      return {
        success: true,
        message: 'リポジトリからも削除同期（コミット）が完了しました！',
      };
    } else {
      const errData = await putRes.json().catch(() => ({}));
      return {
        success: false,
        message: `リポジトリからの削除コミットに失敗しました: ${errData.message || ''}`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `通信エラー: ${err.message || String(err)}`,
    };
  }
};

export const saveCharacterToGitHub = async (character: CharacterData) => {
  return syncItemToGitHub(
    'public/data/characters.json',
    character,
    `feat(data): 探索者「${character.name || '未設定'}」を追加・更新`
  );
};

export const deleteCharacterFromGitHub = async (characterId: string, characterName?: string) => {
  return removeItemFromGitHub(
    'public/data/characters.json',
    characterId,
    `feat(data): 探索者「${characterName || characterId}」を削除`
  );
};

export const saveScenarioToGitHub = async (scenario: ScenarioData) => {
  return syncItemToGitHub(
    'public/data/scenarios.json',
    scenario,
    `feat(data): シナリオ「${scenario.title || '未設定'}」を追加・更新`
  );
};

export const deleteScenarioFromGitHub = async (scenarioId: string, scenarioTitle?: string) => {
  return removeItemFromGitHub(
    'public/data/scenarios.json',
    scenarioId,
    `feat(data): シナリオ「${scenarioTitle || scenarioId}」を削除`
  );
};

export const fetchRepositoryData = async () => {
  let remoteCharacters: CharacterData[] = [];
  let remoteScenarios: ScenarioData[] = [];
  const deletedIds = getDeletedIds();

  try {
    const charRes = await fetch('./data/characters.json?t=' + Date.now(), { cache: 'no-store' });
    if (charRes.ok) {
      const list: CharacterData[] = await charRes.json();
      remoteCharacters = list.filter(c => !deletedIds.includes(c.id));
    }
  } catch (e) {
    console.warn('Failed to fetch remote characters.json', e);
  }

  try {
    const scenRes = await fetch('./data/scenarios.json?t=' + Date.now(), { cache: 'no-store' });
    if (scenRes.ok) {
      const list: ScenarioData[] = await scenRes.json();
      remoteScenarios = list.filter(s => !deletedIds.includes(s.id));
    }
  } catch (e) {
    console.warn('Failed to fetch remote scenarios.json', e);
  }

  return { remoteCharacters, remoteScenarios };
};
