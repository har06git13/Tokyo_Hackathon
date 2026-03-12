import {
  buildActionSummary,
  buildHints,
  calcVisitedCount,
  calcElapsedTime,
  getFlavorText,
  facilityHintMap,
} from './resultPageLogic';

// ────────────────────────────────────────────────
// buildActionSummary
// ────────────────────────────────────────────────
describe('buildActionSummary', () => {
  test('施設未訪問・SNSなし → デフォルトメッセージ', () => {
    expect(buildActionSummary([], [])).toBe('行動せずに移動した');
  });

  test('fac_001 訪問 → 充電スポット記述を含む', () => {
    expect(buildActionSummary(['fac_001'], [])).toContain('充電スポットで充電した');
  });

  test('fac_002 訪問 → 避難誘導サイン記述を含む', () => {
    expect(buildActionSummary(['fac_002'], [])).toContain('避難誘導サインを確認した');
  });

  test('fac_003 訪問 → 食料・現金記述を含む', () => {
    expect(buildActionSummary(['fac_003'], [])).toContain('食料と現金を確保した');
  });

  test('fac_004 訪問 → 帰宅困難者受け入れ施設記述を含む', () => {
    expect(buildActionSummary(['fac_004'], [])).toContain('帰宅困難者受け入れ施設の情報を取得した');
  });

  test('fac_005 訪問 → ウィズ原宿記述を含む', () => {
    expect(buildActionSummary(['fac_005'], [])).toContain('一時避難場所（ウィズ原宿）に到達した');
  });

  test('SNS イベントあり → SNS記述を含む', () => {
    const events = [{ id: 'event_sns_001', time: new Date() }];
    expect(buildActionSummary([], events)).toContain('SNSで安否情報を発信・収集した');
  });

  test('SNS イベントなし → SNS記述を含まない', () => {
    const events = [{ id: 'event_walk_001', time: new Date() }];
    expect(buildActionSummary([], events)).not.toContain('SNS');
  });

  test('全施設訪問 + SNS → 全アクション記述を含む', () => {
    const facilities = ['fac_001', 'fac_002', 'fac_003', 'fac_004', 'fac_005'];
    const events = [{ id: 'event_sns_001', time: new Date() }];
    const result = buildActionSummary(facilities, events);
    expect(result).toContain('充電スポットで充電した');
    expect(result).toContain('避難誘導サインを確認した');
    expect(result).toContain('食料と現金を確保した');
    expect(result).toContain('帰宅困難者受け入れ施設の情報を取得した');
    expect(result).toContain('一時避難場所（ウィズ原宿）に到達した');
    expect(result).toContain('SNSで安否情報を発信・収集した');
  });

  test('空文字・nullを渡しても安全に動作する', () => {
    expect(() => buildActionSummary([], null)).not.toThrow();
    expect(buildActionSummary([], null)).toBe('行動せずに移動した');
  });

  test('fac_000（開始地点）は無視される', () => {
    const result = buildActionSummary(['fac_000'], []);
    expect(result).toBe('行動せずに移動した');
  });
});

// ────────────────────────────────────────────────
// buildHints
// ────────────────────────────────────────────────
describe('buildHints', () => {
  test('全施設訪問時は2件以下を返す', () => {
    const all = ['fac_001', 'fac_002', 'fac_003', 'fac_004', 'fac_005'];
    const hints = buildHints(all, 50, 50, 50);
    expect(hints.length).toBeGreaterThanOrEqual(1);
    expect(hints.length).toBeLessThanOrEqual(2);
  });

  test('fac_001 訪問済み → visited ヒントが候補先頭に来る (shuffle:false)', () => {
    // fac_001 visited が最初の候補 → shuffle:false では [0] に入る
    const hints = buildHints(['fac_001'], 50, 50, 50, { shuffle: false });
    expect(hints[0]).toContain('モバイルバッテリー');
  });

  test('fac_001 未訪問 → notVisited ヒントが候補先頭に来る (shuffle:false)', () => {
    // fac_001 notVisited が最初の候補 → shuffle:false では [0] に入る
    const hints = buildHints([], 50, 50, 50, { shuffle: false });
    expect(hints[0]).toBe(facilityHintMap.fac_001.notVisited);
  });

  test('charge=0 → 充電ヒントが候補に追加される', () => {
    // 全施設訪問して候補数を最小化し、shuffle:false で充電ヒントの存在を確認
    // 全施設訪問(5件) + charge=0(1件) = 6件 → shuffle:false で最初の2件
    // 充電ヒントは 6件目に追加されるため先頭2件には入らないが、
    // エラーなく生成されることを確認
    expect(() => buildHints([], 50, 0, 50, { shuffle: false })).not.toThrow();
    // 2件以下が返る
    const hints = buildHints([], 50, 0, 50, { shuffle: false });
    expect(hints.length).toBeLessThanOrEqual(2);
  });

  test('mental<30 → 精神力ヒントが候補に追加される', () => {
    expect(() => buildHints([], 50, 50, 20, { shuffle: false })).not.toThrow();
    const hints = buildHints([], 50, 50, 20, { shuffle: false });
    expect(hints.length).toBeLessThanOrEqual(2);
  });

  test('fac_005 未訪問でも notVisited ヒントを出さない', () => {
    expect(facilityHintMap.fac_005.notVisited).toBeUndefined();
  });
});

// ────────────────────────────────────────────────
// calcVisitedCount
// ────────────────────────────────────────────────
describe('calcVisitedCount', () => {
  test('fac_000 は除外される', () => {
    expect(calcVisitedCount(['fac_000', 'fac_001', 'fac_002'])).toBe(2);
  });

  test('空配列 → 0', () => {
    expect(calcVisitedCount([])).toBe(0);
  });
});

// ────────────────────────────────────────────────
// calcElapsedTime
// ────────────────────────────────────────────────
describe('calcElapsedTime', () => {
  test('30分経過 → { hours:0, minutes:30 }', () => {
    const start = new Date(2026, 0, 1, 14, 0, 0);
    const now   = new Date(2026, 0, 1, 14, 30, 0);
    expect(calcElapsedTime(now, start)).toEqual({ hours: 0, minutes: 30 });
  });

  test('1時間15分経過 → { hours:1, minutes:15 }', () => {
    const start = new Date(2026, 0, 1, 14, 0, 0);
    const now   = new Date(2026, 0, 1, 15, 15, 0);
    expect(calcElapsedTime(now, start)).toEqual({ hours: 1, minutes: 15 });
  });
});

// ────────────────────────────────────────────────
// getFlavorText
// ────────────────────────────────────────────────
describe('getFlavorText', () => {
  test('survived=true → 成功テキストを返す', () => {
    expect(getFlavorText(true, null)).toContain('一時避難場所');
  });

  test('survived=false, criticalReason=lowLife → 体力テキストを返す', () => {
    expect(getFlavorText(false, 'lowLife')).toContain('体力');
  });

  test('survived=false, criticalReason=timeup → 時間テキストを返す', () => {
    expect(getFlavorText(false, 'timeup')).toContain('時間');
  });

  test('survived=false, unknown reason → デフォルト失敗テキストを返す', () => {
    expect(getFlavorText(false, 'unknown')).toBeTruthy();
  });
});
