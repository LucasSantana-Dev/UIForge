/**
 * Server API Polyfills for Testing
 * Provides minimal implementations of Web APIs needed for Next.js server components
 */

import { TextEncoder, TextDecoder } from 'util';

// Text encoding
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// Minimal Request implementation
class MockRequest {
  private _url: string;
  method: string;
  headers: Map<string, string>;
  body: any;

  constructor(url: string, init?: any) {
    this._url = url;
    this.method = init?.method || 'GET';
    this.headers = new Map();
    this.body = init?.body;

    if (init?.headers) {
      Object.entries(init.headers).forEach(([key, value]) => {
        this.headers.set(key, value as string);
      });
    }
  }

  get url() {
    return this._url;
  }

  async json() {
    if (this.body == null) {
      return null;
    }
    try {
      return JSON.parse(this.body);
    } catch (error) {
      throw new Error(
        `Failed to parse JSON: ${error instanceof Error ? error.message : 'Invalid JSON'}`
      );
    }
  }

  async text() {
    return this.body;
  }
}

// Minimal Response implementation
class MockResponse {
  status: number;
  statusText: string;
  headers: Map<string, string>;
  body: any;

  constructor(body?: any, init?: any) {
    this.body = body;
    this.status = init?.status || 200;
    this.statusText = init?.statusText || 'OK';
    this.headers = new Map();

    if (init?.headers) {
      Object.entries(init.headers).forEach(([key, value]) => {
        this.headers.set(key, value as string);
      });
    }
  }

  static json(data: any, init?: any) {
    return new MockResponse(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
  }

  async json() {
    if (this.body == null) {
      return null;
    }
    try {
      return JSON.parse(this.body);
    } catch (error) {
      throw new Error(
        `Failed to parse JSON: ${error instanceof Error ? error.message : 'Invalid JSON'}`
      );
    }
  }

  async text() {
    return this.body;
  }
}

// Minimal Headers implementation
class MockHeaders {
  private headers: Map<string, string>;

  constructor(init?: any) {
    this.headers = new Map();
    if (init) {
      Object.entries(init).forEach(([key, value]) => {
        this.headers.set(key.toLowerCase(), value as string);
      });
    }
  }

  get(name: string) {
    return this.headers.get(name.toLowerCase()) || null;
  }

  set(name: string, value: string) {
    this.headers.set(name.toLowerCase(), value);
  }

  has(name: string) {
    return this.headers.has(name.toLowerCase());
  }

  delete(name: string) {
    this.headers.delete(name.toLowerCase());
  }

  forEach(callback: (value: string, key: string) => void) {
    this.headers.forEach(callback);
  }
}

// Apply polyfills
if (typeof global.Request === 'undefined') {
  global.Request = MockRequest as any;
}
if (typeof global.Response === 'undefined') {
  global.Response = MockResponse as any;
}
if (typeof global.Headers === 'undefined') {
  global.Headers = MockHeaders as any;
}

export { MockRequest, MockResponse, MockHeaders };
