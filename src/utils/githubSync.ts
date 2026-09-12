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

  // キャッシュによるSHA不一致を防ぐためのキャッシュバスター
  const timestamp = Date.now();
  const getUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}?ref=${config.branch}&_nocache=${timestamp}`;
  const putUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`;

  // トークンのBearer/token対応
  const authHeader = config.token.startsWith('Bearer ') || config.token.startsWith('token ')
    ? config.token
    : `Bearer ${config.token}`;

  try {
    // 1. 最新のファイルSHAと内容を取得
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
        console.warn('Existing content parse error', err);
        currentList = [];
      }
    } else if (getRes.status === 404) {
      currentList = [];
    } else {
      const errData = await getRes.json().catch(() => ({}));
      let hint = '';
      if (getRes.status === 401) {
        hint = '（トークンが誤っているか、有効期限切れの可能性があります）';
      } else if (getRes.status === 403) {
        hint = '（トークンの権限に「repo」がチェックされているか確認してください）';
      }
      return {
        success: false,
        message: `ファイルの取得に失敗しました [HTTP ${getRes.status}]: ${errData.message || ''} ${hint}`,
      };
    }

    // 2. アイテムをマージ
    const index = currentList.findIndex(existing => existing.id === item.id);
    if (index >= 0) {
      currentList[index] = item;
    } else {
      currentList.unshift(item);
    }

    // 3. PUTリクエストでコミット
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
      let hint = '';
      if (putRes.status === 403) {
        hint = '\n\n【原因の可能性】\nトークンに「repo（書き込み権限）」が付いていないか、Fine-grained TokenでRepository permissionsの「Contents: Read and write」が許可されていない可能性があります。';
      } else if (putRes.status === 409) {
        hint = '\n\n【原因の可能性】\nコミットの衝突が発生しました。もう一度「リポジトリ保存」を押してください。';
      } else if (putRes.status === 401) {
        hint = '\n\n【原因の可能性】\nトークンが無効です。';
      }

      return {
        success: false,
        message: `コミットの送信に失敗しました [HTTP ${putRes.status}]: ${errData.message || '不明なエラー'}${hint}`,
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

export const saveScenarioToGitHub = async (scenario: ScenarioData) => {
  return syncItemToGitHub(
    'public/data/scenarios.json',
    scenario,
    `feat(data): シナリオ「${scenario.title || '未設定'}」を追加・更新`
  );
};

export const fetchRepositoryData = async () => {
  let remoteCharacters: CharacterData[] = [];
  let remoteScenarios: ScenarioData[] = [];

  try {
    const charRes = await fetch('./data/characters.json?t=' + Date.now(), { cache: 'no-store' });
    if (charRes.ok) {
      remoteCharacters = await charRes.json();
    }
  } catch (e) {
    console.warn('Failed to fetch remote characters.json', e);
  }

  try {
    const scenRes = await fetch('./data/scenarios.json?t=' + Date.now(), { cache: 'no-store' });
    if (scenRes.ok) {
      remoteScenarios = await scenRes.json();
    }
  } catch (e) {
    console.warn('Failed to fetch remote scenarios.json', e);
  }

  return { remoteCharacters, remoteScenarios };
};
