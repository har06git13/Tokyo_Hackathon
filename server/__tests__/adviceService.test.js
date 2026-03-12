'use strict';

const { getAdvice, cacheKey } = require('../adviceService');

// ────────────────────────────────────────────────
// モック依存オブジェクト
// ────────────────────────────────────────────────

const MOCK_FILE = { uri: 'https://example.com/file.pdf', name: 'files/test' };

function makeDeps(overrides = {}) {
  const cache = {};
  return {
    genaiClient: {
      models: {
        generateContent: jest.fn().mockResolvedValue({ text: 'テストアドバイス' }),
      },
    },
    geminiFiles: [MOCK_FILE],
    cache,
    saveCache: jest.fn(),
    getLastCallTime: () => 0,
    setLastCallTime: jest.fn(),
    ...overrides,
  };
}

// ────────────────────────────────────────────────
// cacheKey
// ────────────────────────────────────────────────
describe('cacheKey', () => {
  test('同じ文字列 → 同じキー', () => {
    expect(cacheKey('充電スポットで充電した')).toBe(cacheKey('充電スポットで充電した'));
  });

  test('異なる文字列 → 異なるキー', () => {
    expect(cacheKey('充電スポットで充電した')).not.toBe(cacheKey('食料と現金を確保した'));
  });

  test('前後の空白は無視される', () => {
    expect(cacheKey('  充電  ')).toBe(cacheKey('充電'));
  });

  test('64文字の hex 文字列を返す', () => {
    expect(cacheKey('test')).toMatch(/^[0-9a-f]{64}$/);
  });
});

// ────────────────────────────────────────────────
// getAdvice – 基本動作
// ────────────────────────────────────────────────
describe('getAdvice - 基本動作', () => {
  test('空文字 → null を返す', async () => {
    const deps = makeDeps();
    expect(await getAdvice('', deps)).toBeNull();
    expect(await getAdvice('   ', deps)).toBeNull();
    expect(deps.genaiClient.models.generateContent).not.toHaveBeenCalled();
  });

  test('Gemini 未設定（genaiClient=null）→ null を返す', async () => {
    const deps = makeDeps({ genaiClient: null });
    const result = await getAdvice('充電した', deps);
    expect(result).toBeNull();
  });

  test('geminiFiles が空 → null を返す', async () => {
    const deps = makeDeps({ geminiFiles: [] });
    const result = await getAdvice('充電した', deps);
    expect(result).toBeNull();
    expect(deps.genaiClient.models.generateContent).not.toHaveBeenCalled();
  });

  test('Gemini が正常にアドバイスを返す', async () => {
    const deps = makeDeps();
    const result = await getAdvice('充電スポットで充電した', deps);
    expect(result).toBe('テストアドバイス');
    expect(deps.genaiClient.models.generateContent).toHaveBeenCalledTimes(1);
  });

  test('Gemini が空テキストを返した場合 → null', async () => {
    const deps = makeDeps({
      genaiClient: {
        models: { generateContent: jest.fn().mockResolvedValue({ text: '' }) },
      },
    });
    const result = await getAdvice('充電した', deps);
    expect(result).toBeNull();
  });

  test('Gemini がテキストに改行を含む場合 → 改行を除去して返す', async () => {
    const deps = makeDeps({
      genaiClient: {
        models: { generateContent: jest.fn().mockResolvedValue({ text: '行1\n行2\n行3' }) },
      },
    });
    const result = await getAdvice('充電した', deps);
    expect(result).toBe('行1行2行3');
    expect(result).not.toContain('\n');
  });
});

// ────────────────────────────────────────────────
// getAdvice – キャッシュ
// ────────────────────────────────────────────────
describe('getAdvice - キャッシュ', () => {
  test('キャッシュヒット時は Gemini を呼ばない', async () => {
    const actions = '充電した';
    const key = cacheKey(actions);
    const deps = makeDeps({ cache: { [key]: 'キャッシュアドバイス' } });
    const result = await getAdvice(actions, deps);
    expect(result).toBe('キャッシュアドバイス');
    expect(deps.genaiClient.models.generateContent).not.toHaveBeenCalled();
  });

  test('Gemini 呼び出し成功後にキャッシュへ保存する', async () => {
    const deps = makeDeps();
    await getAdvice('充電した', deps);
    expect(deps.saveCache).toHaveBeenCalledTimes(1);
    const savedCache = deps.saveCache.mock.calls[0][0];
    const key = cacheKey('充電した');
    expect(savedCache[key]).toBe('テストアドバイス');
  });

  test('Gemini が null を返した場合はキャッシュに保存しない', async () => {
    const deps = makeDeps({
      genaiClient: {
        models: { generateContent: jest.fn().mockResolvedValue({ text: '' }) },
      },
    });
    await getAdvice('充電した', deps);
    expect(deps.saveCache).not.toHaveBeenCalled();
  });

  test('同一 actions を2回呼ぶと Gemini は1回のみ呼ばれる', async () => {
    const deps = makeDeps();
    await getAdvice('充電した', deps);
    await getAdvice('充電した', deps);
    expect(deps.genaiClient.models.generateContent).toHaveBeenCalledTimes(1);
  });
});

// ────────────────────────────────────────────────
// getAdvice – エラーハンドリング
// ────────────────────────────────────────────────
describe('getAdvice - エラーハンドリング', () => {
  test('Gemini が 503 で2回失敗後に成功する場合は最終的にアドバイスを返す', async () => {
    let callCount = 0;
    const deps = makeDeps({
      genaiClient: {
        models: {
          generateContent: jest.fn().mockImplementation(() => {
            callCount++;
            if (callCount <= 2) {
              const err = new Error('Service Unavailable');
              err.status = 503;
              return Promise.reject(err);
            }
            return Promise.resolve({ text: 'リトライ成功アドバイス' });
          }),
        },
      },
    });

    // 内部の setTimeout をモックしてテストを高速化
    jest.useFakeTimers();
    const promise = getAdvice('充電した', deps);
    // リトライ待機タイマーを進める
    await jest.runAllTimersAsync();
    const result = await promise;
    jest.useRealTimers();

    expect(result).toBe('リトライ成功アドバイス');
    expect(callCount).toBe(3);
  });

  test('Gemini が MAX_RETRIES 超えてエラーを投げる場合は例外を伝播する', async () => {
    const err = new Error('Persistent error');
    err.status = 503;
    const deps = makeDeps({
      genaiClient: {
        models: { generateContent: jest.fn().mockRejectedValue(err) },
      },
    });

    jest.useFakeTimers();
    const promise = getAdvice('充電した', deps);
    await jest.runAllTimersAsync();
    jest.useRealTimers();

    await expect(promise).rejects.toThrow('Persistent error');
  });

  test('リトライ対象外エラー（400）は即座に例外を伝播する', async () => {
    const err = new Error('Bad Request');
    err.status = 400;
    const deps = makeDeps({
      genaiClient: {
        models: { generateContent: jest.fn().mockRejectedValue(err) },
      },
    });
    await expect(getAdvice('充電した', deps)).rejects.toThrow('Bad Request');
    expect(deps.genaiClient.models.generateContent).toHaveBeenCalledTimes(1);
  });
});
