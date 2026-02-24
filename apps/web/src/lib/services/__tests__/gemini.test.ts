import { generateComponentStream, GeminiGenerateOptions } from '../gemini';

const mockGenerateContentStream = jest.fn();

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContentStream: mockGenerateContentStream,
    }),
  })),
}));

const baseOptions: GeminiGenerateOptions = {
  prompt: 'Create a button component',
  framework: 'react',
  componentLibrary: 'tailwind',
  typescript: true,
  apiKey: 'test-api-key',
};

describe('generateComponentStream', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('yields start, chunks, and complete events', async () => {
    mockGenerateContentStream.mockResolvedValue({
      stream: (async function* () {
        yield { text: () => 'import React' };
        yield { text: () => ' from "react";\n' };
        yield { text: () => 'export default function Button() {}' };
      })(),
    });

    const events = [];
    for await (const event of generateComponentStream(baseOptions)) {
      events.push(event);
    }

    expect(events[0].type).toBe('start');
    expect(events[1]).toMatchObject({
      type: 'chunk',
      content: 'import React',
    });
    expect(events[2]).toMatchObject({
      type: 'chunk',
      content: ' from "react";\n',
    });
    expect(events[3]).toMatchObject({
      type: 'chunk',
      content: 'export default function Button() {}',
    });
    expect(events[4].type).toBe('complete');
    expect(events).toHaveLength(5);
  });

  it('yields error when no API key provided', async () => {
    const events = [];
    for await (const event of generateComponentStream({
      ...baseOptions,
      apiKey: undefined,
    })) {
      events.push(event);
    }

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('error');
    expect(events[0].message).toContain('API key is required');
  });

  it('yields error event on SDK failure', async () => {
    mockGenerateContentStream.mockRejectedValue(new Error('quota exceeded'));

    const events = [];
    for await (const event of generateComponentStream(baseOptions)) {
      events.push(event);
    }

    expect(events[0].type).toBe('start');
    expect(events[1]).toMatchObject({
      type: 'error',
      message: 'quota exceeded',
    });
  });

  it('skips empty text chunks', async () => {
    mockGenerateContentStream.mockResolvedValue({
      stream: (async function* () {
        yield { text: () => '' };
        yield { text: () => 'code' };
        yield { text: () => '' };
      })(),
    });

    const events = [];
    for await (const event of generateComponentStream(baseOptions)) {
      events.push(event);
    }

    const chunks = events.filter((e) => e.type === 'chunk');
    expect(chunks).toHaveLength(1);
    expect(chunks[0].content).toBe('code');
  });

  it('uses provided apiKey for BYOK', async () => {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    mockGenerateContentStream.mockResolvedValue({
      stream: (async function* () {
        yield { text: () => 'code' };
      })(),
    });

    const events = [];
    for await (const event of generateComponentStream({
      ...baseOptions,
      apiKey: 'user-byok-key',
    })) {
      events.push(event);
    }

    expect(GoogleGenerativeAI).toHaveBeenCalledWith('user-byok-key');
  });

  it('includes timestamps on all events', async () => {
    mockGenerateContentStream.mockResolvedValue({
      stream: (async function* () {
        yield { text: () => 'code' };
      })(),
    });

    const events = [];
    for await (const event of generateComponentStream(baseOptions)) {
      events.push(event);
    }

    for (const event of events) {
      expect(event.timestamp).toBeDefined();
      expect(typeof event.timestamp).toBe('number');
    }
  });
});
