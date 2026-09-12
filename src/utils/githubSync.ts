import type { CharacterData } from '../types/character';
import type { ScenarioData } from '../types/scenario';

const GITHUB_CONFIG_KEY = 'coc_toolkit_github_config_v1';

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

// Unicode安全なBase64エンコーダ/デコーダ
const toBase64 = (str: string): string => {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  }));
};

const fromBase64 = (base64: string): string => {
  const clean = base64.replace(/\n/g, '');
  return decodeURIComponent(
    Array.prototype.map
      .call(atob(clean), (c: string) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );
};

// --- GitHub API 経由でファイルを保存・追記 ---
interface GitHubFileResponse {
  sha: string;
  content: string;
}

export const syncItemToGitHub = async <T extends { id: string }>(
  filePath: string,
  item: T,
  commitMessage: string
): Promise<{ success: boolean; message: string }> => {
  const config = loadGitHubConfig();
  if (!config.token.trim()) {
    return {
      success: false,
      message: 'GitHub APIトークンが設定されていません。画面上部の歯車アイコンからトークンを設定してください。',
    };
  }

  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}?ref=${config.branch}`;

  try {
    // 1. 現在のファイル状態を取得
    let sha: string | undefined = undefined;
    let currentList: T[] = [];

    const getRes = await fetch(url, {
      headers: {
        Authorization: `token ${config.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (getRes.ok) {
      const data: GitHubFileResponse = await getRes.json();
      sha = data.sha;
      try {
        const decoded = fromBase64(data.content);
        currentList = JSON.parse(decoded);
      } catch (err) {
        console.warn('Existing content parse error, starting fresh array', err);
        currentList = [];
      }
    } else if (getRes.status === 404) {
      // ファイル未作成時は空配列から開始
      currentList = [];
    } else {
      const errData = await getRes.json().catch(() => ({}));
      return {
        success: false,
        message: `GitHubファイルの取得に失敗しました (${getRes.status}): ${errData.message || ''}`,
      };
    }

    // 2. アイテムをマージ（同一IDがあれば更新、なければ先頭に追加）
    const index = currentList.findIndex(existing => existing.id === item.id);
    if (index >= 0) {
      currentList[index] = item;
    } else {
      currentList.unshift(item);
    }

    // 3. GitHubへPUTリクエスト（自動コミット）
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

    const putRes = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${config.token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(putBody),
    });

    if (putRes.ok) {
      return {
        success: true,
        message: 'リポジトリに保存（コミット）が完了しました！数分で全端末に同期されます。',
      };
    } else {
      const errData = await putRes.json().catch(() => ({}));
      return {
        success: false,
        message: `コミットの送信に失敗しました (${putRes.status}): ${errData.message || ''}`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `通信エラーが発生しました: ${err.message || String(err)}`,
    };
  }
};

// --- キャラクターの同期 ---
export const saveCharacterToGitHub = async (character: CharacterData) => {
  return syncItemToGitHub(
    'public/data/characters.json',
    character,
    `feat(data): 探索者「${character.name || '未設定'}」を追加・更新`
  );
};

// --- シナリオの同期 ---
export const saveScenarioToGitHub = async (scenario: ScenarioData) => {
  return syncItemToGitHub(
    'public/data/scenarios.json',
    scenario,
    `feat(data): シナリオ「${scenario.title || '未設定'}」を追加・更新`
  );
};

// --- リポジトリの最新データを取得（他端末での自動読み込み用） ---
export const fetchRepositoryData = async () => {
  let remoteCharacters: CharacterData[] = [];
  let remoteScenarios: ScenarioData[] = [];

  try {
    const charRes = await fetch('./data/characters.json?t=' + Date.now());
    if (charRes.ok) {
      remoteCharacters = await charRes.json();
    }
  } catch (e) {
    console.warn('Failed to fetch remote characters.json', e);
  }

  try {
    const scenRes = await fetch('./data/scenarios.json?t=' + Date.now());
    if (scenRes.ok) {
      remoteScenarios = await scenRes.json();
    }
  } catch (e) {
    console.warn('Failed to fetch remote scenarios.json', e);
  }

  return { remoteCharacters, remoteScenarios };
};
