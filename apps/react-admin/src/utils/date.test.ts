import { describe, expect, it } from 'vitest';

import { parsePlatformMillis } from './date';

describe('parsePlatformMillis', () => {
  const utc8am = Date.parse('2026-08-14T08:00:00Z');

  it('treats naive strings as Asia/Shanghai', () => {
    expect(parsePlatformMillis('2026-08-14T16:00:00')).toBe(utc8am);
    expect(parsePlatformMillis('2026-08-14 16:00:00')).toBe(utc8am);
  });

  it('parses offset strings as instants', () => {
    expect(parsePlatformMillis('2026-08-14T16:00:00+08:00')).toBe(utc8am);
    expect(parsePlatformMillis('2026-08-14T08:00:00Z')).toBe(utc8am);
  });
});
