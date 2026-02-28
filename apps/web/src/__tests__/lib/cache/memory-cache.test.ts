import { TTLCache } from '@/lib/cache/memory-cache';

describe('TTLCache', () => {
  it('stores and retrieves values', () => {
    const cache = new TTLCache<string>(60000);
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('returns undefined for missing keys', () => {
    const cache = new TTLCache<string>(60000);
    expect(cache.get('missing')).toBeUndefined();
  });

  it('expires entries after TTL', () => {
    const cache = new TTLCache<string>(100);
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');

    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 200);
    expect(cache.get('key1')).toBeUndefined();
    jest.restoreAllMocks();
  });

  it('deletes entries', () => {
    const cache = new TTLCache<string>(60000);
    cache.set('key1', 'value1');
    expect(cache.delete('key1')).toBe(true);
    expect(cache.get('key1')).toBeUndefined();
  });

  it('clears all entries', () => {
    const cache = new TTLCache<string>(60000);
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.clear();
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBeUndefined();
  });

  it('evicts LRU entry when max entries exceeded', () => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);

    const cache = new TTLCache<string>(60000, 2);
    cache.set('key1', 'value1');

    jest.spyOn(Date, 'now').mockReturnValue(now + 10);
    cache.set('key2', 'value2');

    jest.spyOn(Date, 'now').mockReturnValue(now + 20);
    cache.get('key2');

    jest.spyOn(Date, 'now').mockReturnValue(now + 30);
    cache.set('key3', 'value3');

    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBe('value2');
    expect(cache.get('key3')).toBe('value3');
    jest.restoreAllMocks();
  });

  it('reports correct size excluding expired', () => {
    const cache = new TTLCache<string>(100);
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');

    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 200);
    expect(cache.size).toBe(0);
    jest.restoreAllMocks();
  });

  it('overwrites existing keys', () => {
    const cache = new TTLCache<string>(60000);
    cache.set('key1', 'value1');
    cache.set('key1', 'updated');
    expect(cache.get('key1')).toBe('updated');
  });
});
