export type GenerationErrorCategory =
  | 'provider-capacity'
  | 'rate-limit'
  | 'quota'
  | 'auth'
  | 'validation'
  | 'provider'
  | 'network'
  | 'unknown';

export interface GenerationErrorInfo {
  category: GenerationErrorCategory;
  title: string;
  message: string;
  suggestion: string;
}

const ERROR_PATTERNS: Array<{
  test: (msg: string) => boolean;
  info: GenerationErrorInfo;
}> = [
  {
    test: (msg) =>
      /provider capacity|free-tier capacity|resource_exhausted|current quota|capacity reached/i.test(
        msg
      ),
    info: {
      category: 'provider-capacity',
      title: 'AI capacity reached',
      message: 'Siza shared provider capacity is currently exhausted.',
      suggestion: 'Retry in a few minutes or add your own provider key in AI Keys.',
    },
  },
  {
    test: (msg) => /rate limit/i.test(msg),
    info: {
      category: 'rate-limit',
      title: 'Too many requests',
      message: 'You\u2019ve hit the rate limit for generation requests.',
      suggestion: 'Wait a minute and try again.',
    },
  },
  {
    test: (msg) =>
      /generation quota exceeded|billing period|monthly limit reached|upgrade your plan/i.test(msg),
    info: {
      category: 'quota',
      title: 'Generation limit reached',
      message: 'You\u2019ve used all your generations for this billing period.',
      suggestion: 'Upgrade your plan for more generations, or wait until your quota resets.',
    },
  },
  {
    test: (msg) => /authentication|sign in|unauthorized|not authenticated/i.test(msg),
    info: {
      category: 'auth',
      title: 'Authentication required',
      message: 'Your session has expired or you need to sign in.',
      suggestion: 'Sign in again to continue generating.',
    },
  },
  {
    test: (msg) => /invalid request|validation|required field|must be/i.test(msg),
    info: {
      category: 'validation',
      title: 'Invalid input',
      message: 'The generation request has missing or invalid fields.',
      suggestion: 'Check your description and settings, then try again.',
    },
  },
  {
    test: (msg) => /api key|provider.*error|model.*not|service unavailable|503|502/i.test(msg),
    info: {
      category: 'provider',
      title: 'AI provider issue',
      message: 'The AI provider is temporarily unavailable or returned an error.',
      suggestion: 'Try a different provider or model, or wait a few minutes.',
    },
  },
  {
    test: (msg) => /network|fetch|connection|timeout|aborted|ECONNREFUSED/i.test(msg),
    info: {
      category: 'network',
      title: 'Connection error',
      message: 'Could not reach the server.',
      suggestion: 'Check your internet connection and try again.',
    },
  },
  {
    test: (msg) => /cancel/i.test(msg),
    info: {
      category: 'unknown',
      title: 'Generation cancelled',
      message: 'The generation was stopped.',
      suggestion: 'Start a new generation when ready.',
    },
  },
];

export function categorizeGenerationError(errorMessage: string): GenerationErrorInfo {
  for (const pattern of ERROR_PATTERNS) {
    if (pattern.test(errorMessage)) {
      return pattern.info;
    }
  }

  return {
    category: 'unknown',
    title: 'Generation failed',
    message: errorMessage,
    suggestion: 'Try again, or use a different prompt or provider.',
  };
}
