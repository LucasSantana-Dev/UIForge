import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OllamaClient, getOllamaClient } from '../main/ollama-client';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('OllamaClient', () => {
  let client: OllamaClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new OllamaClient('http://localhost:11434');
  });

  describe('checkConnection', () => {
    it('returns true when Ollama responds OK', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      expect(await client.checkConnection()).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/version',
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      );
    });

    it('returns false when Ollama responds with error', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });
      expect(await client.checkConnection()).toBe(false);
    });

    it('returns false when fetch throws', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection refused'));
      expect(await client.checkConnection()).toBe(false);
    });
  });

  describe('chat', () => {
    it('sends correct request and returns response', async () => {
      const mockResponse = {
        model: 'codellama:7b',
        message: { role: 'assistant', content: 'export function Button() {}' },
        done: true,
        total_duration: 5_000_000_000,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await client.chat({
        model: 'codellama:7b',
        messages: [
          { role: 'system', content: 'You are a UI engineer.' },
          { role: 'user', content: 'Create a button' },
        ],
      });

      expect(result.message.content).toBe('export function Button() {}');
      expect(result.model).toBe('codellama:7b');

      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:11434/api/chat');
      const body = JSON.parse(opts.body);
      expect(body.stream).toBe(false);
      expect(body.model).toBe('codellama:7b');
      expect(body.messages).toHaveLength(2);
    });

    it('throws on non-OK response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve('model not found'),
      });

      await expect(
        client.chat({
          model: 'nonexistent',
          messages: [{ role: 'user', content: 'test' }],
        })
      ).rejects.toThrow('Ollama API error 404: model not found');
    });
  });

  describe('setBaseUrl', () => {
    it('strips trailing slash', () => {
      client.setBaseUrl('http://custom:1234/');
      mockFetch.mockResolvedValueOnce({ ok: true });
      client.checkConnection();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://custom:1234/api/version',
        expect.anything()
      );
    });
  });
});

describe('getOllamaClient', () => {
  it('returns singleton instance', () => {
    const a = getOllamaClient('http://localhost:11434');
    const b = getOllamaClient();
    expect(a).toBe(b);
  });
});
